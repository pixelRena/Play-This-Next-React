import { useContext } from "react";
import { Store } from "context/Store.context";
import { NotificationContext } from "components/notification/Notification.context";

export const useSetUsername = () => {
  const { usernameApi } = useContext(Store);
  const { notification } = useContext(NotificationContext);

  const setUsername = async () => {
    let newUsername = prompt("Enter your twitch username:");

    let request = await usernameApi(newUsername);
    request
      ? notification("Username updated!")
      : notification("Request cancelled or failed.");
  };

  return setUsername;
};
