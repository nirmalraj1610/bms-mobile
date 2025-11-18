import Toast from "react-native-toast-message";

const showSuccess = (message: string) => {
  Toast.show({
    type: "success",
    text1: "Success",
    text2: message,
    position: "top",
  });
};

const showError = (message: string) => {
  Toast.show({
    type: "error",
    text1: "Error",
    text2: message,
    position: "top",
  });
};

const showInfo = (message: string) => {
  Toast.show({
    type: "info",
    text1: "Info",
    text2: message,
    position: "top",
  });
};

export { showSuccess, showError, showInfo };
