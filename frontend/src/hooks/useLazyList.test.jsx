import { act, cleanup, render } from "@testing-library/react/pure"
import useLazyList, { LOAD_DELAY_MS } from "./useLazyList"

const items = Array.from({ length: 25 }, (_, i) => ({ name: `Game ${i}` }))

let observers
class FakeObserver {
  constructor(callback) {
    this.callback = callback
    observers.push(this)
  }
  observe() {}
  disconnect() {
    this.disconnected = true
  }
  // the newest, still-connected observer is the one watching the sentinel
  static scrollIntoView() {
    const live = observers.filter((o) => !o.disconnected).pop()
    live.callback([{ isIntersecting: true }])
  }
}

let latest
// reach the end of the list and wait out the spinner delay
const reach = () => {
  act(() => FakeObserver.scrollIntoView())
  act(() => jest.advanceTimersByTime(LOAD_DELAY_MS))
}
const List = ({ list }) => {
  const { visibleItems, sentinelRef, hasMore } = useLazyList(list, { current: null }, 10)
  latest = visibleItems
  return hasMore ? <div ref={sentinelRef} /> : null
}

beforeEach(() => {
  jest.useFakeTimers()
  observers = []
  window.IntersectionObserver = FakeObserver
})
afterEach(() => {
  cleanup()
  jest.useRealTimers()
  delete window.IntersectionObserver
})

test("starts with one page and adds another each time the end is reached", () => {
  render(<List list={items} />)
  expect(latest).toHaveLength(10)

  reach()
  expect(latest).toHaveLength(20)

  reach()
  expect(latest).toHaveLength(25)
})

test("starts over from the first page when the list changes", () => {
  const { rerender } = render(<List list={items} />)
  reach()
  expect(latest).toHaveLength(20)

  rerender(<List list={items.slice(0, 15)} />)
  expect(latest).toHaveLength(10)
})

test("shows everything when IntersectionObserver is unavailable", () => {
  delete window.IntersectionObserver
  render(<List list={items} />)
  expect(latest).toHaveLength(25)
})

test("a short list needs no observer", () => {
  render(<List list={items.slice(0, 4)} />)
  expect(latest).toHaveLength(4)
  expect(observers).toHaveLength(0)
})

test("waits for the spinner delay before adding a page", () => {
  jest.useFakeTimers()
  render(<List list={items} />)
  act(() => FakeObserver.scrollIntoView())
  expect(latest).toHaveLength(10)
  act(() => jest.advanceTimersByTime(LOAD_DELAY_MS - 1))
  expect(latest).toHaveLength(10)
  act(() => jest.advanceTimersByTime(1))
  expect(latest).toHaveLength(20)
  jest.useRealTimers()
})
