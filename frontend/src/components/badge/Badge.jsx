import "../../styles/Badges.scss"

const Badge = ({ className, children, ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export default Badge
