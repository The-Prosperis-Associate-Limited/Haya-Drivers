import { useMemo } from "react";
import { Country, State } from "country-state-city";

export const useLocationOptions = function (countryName?: string | null) {
  const countries = useMemo(
    () =>
      Country.getAllCountries().map((country) => ({
        label: country.name,
        value: country.name,
      })),
    [],
  );

  const states = useMemo(() => {
    if (!countryName) return [];

    const country = Country.getAllCountries().find(
      (entry) => entry.name === countryName,
    );
    if (!country) return [];

    return State.getStatesOfCountry(country.isoCode).map((state) => ({
      label: state.name,
      value: state.name,
    }));
  }, [countryName]);

  return { countries, states };
};
