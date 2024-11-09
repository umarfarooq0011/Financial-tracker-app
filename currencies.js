// currencies.js

// Function to convert the given amount from one currency to another
export async function convertCurrency(amount, fromCurrency, toCurrency) {
  const apiKey = "bf3f0032a02dd5a145386a0c"; // Use an appropriate API key
  const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const rate = data.rates[toCurrency];
    if (!rate) throw new Error(`Conversion rate not found for ${toCurrency}`);
    return (amount * rate).toFixed(2);
  } catch (error) {
    console.error("Currency conversion error:", error);
    return null;
  }
}

// Function to get all supported currencies
export async function getCurrencies() {
  const url = "https://api.exchangerate-api.com/v4/latest/PKR";

  try {
    const response = await fetch(url);
    const data = await response.json();
    return Object.keys(data.rates);
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return [];
  }
}

// Function to update the currency options dynamically
export async function updateCurrencyOptions(selectElement) {
  const currencies = await getCurrencies();
  selectElement.innerHTML = "";
  currencies.forEach((currency) => {
    const option = document.createElement("option");
    option.value = currency;
    option.textContent = currency;
    selectElement.appendChild(option);
  });
}

// Adding event listener to the currency selector to handle the conversion
export function attachCurrencyConversionListener(
  amountInput,
  currencySelect,
  displayElement
) {
  currencySelect.addEventListener("change", async () => {
    const fromCurrency = currencySelect.value;
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount)) return;
    const convertedAmount = await convertCurrency(amount, fromCurrency, "PKR"); // Example converting to PKR
    if (convertedAmount !== null) {
      displayElement.textContent = `Converted amount: PKR ${convertedAmount}`;
    }
  });
}
