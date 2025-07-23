import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";

export async function saveSecure(key, value) {
  await setItemAsync(key, value);
}

export async function getSecure(key) {
  return await getItemAsync(key);
}

export async function deleteSecure(params) {
  return await deleteItemAsync(params);
}
