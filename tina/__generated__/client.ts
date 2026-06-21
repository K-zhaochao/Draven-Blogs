import { createClient } from "tinacms/dist/client";
import { queries } from "./types.ts";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: 'f25c97db77ea9653dd7be7c62ffe7713cda4d2fb', queries,  });
export default client;
  