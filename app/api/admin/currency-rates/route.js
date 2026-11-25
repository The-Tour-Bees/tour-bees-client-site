import { begin, handleError, json } from "../../../../lib/auth/api";
import { apiUser } from "../../../../lib/auth/guard";
import { readCurrencyRates, saveCurrencyRates } from "../../../../lib/currency-rates";
import { currencyRatesSchema } from "../../../../lib/currency-rates-input";

export async function PUT(request) {
  try {
    const { data, response } = await begin(request, currencyRatesSchema);
    if (response) return response;
    const { error } = await apiUser(["admin"]);
    if (error) return error;

    await saveCurrencyRates(data.rates);
    return json(await readCurrencyRates());
  } catch (err) {
    return handleError(err);
  }
}
