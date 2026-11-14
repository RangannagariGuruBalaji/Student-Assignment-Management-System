
export function getStoredData(key, fallbackData) {
  try {
    const storedData = localStorage.getItem(key);

    return storedData
      ? JSON.parse(storedData)
      : fallbackData;

  } catch (error) {
    console.error("Error reading localStorage:", error);
    return fallbackData;
  }
}

export function saveStoredData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving localStorage:", error);
  }
}
