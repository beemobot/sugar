import { ChargeBee } from "chargebee-typescript";
import { SITE, SITE_API_KEY } from "./config.json";

// Initialize Chargebee object
const chargebee = new ChargeBee();
chargebee.configure({
    site: SITE,
    api_key: SITE_API_KEY,
});

export default chargebee;