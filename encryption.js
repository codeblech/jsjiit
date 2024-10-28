function base64Encode(data) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(data)));
}

function base64Decode(data) {
  return Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
}

// Initialization Vector (IV)
const IV = new TextEncoder().encode("dcek9wb8frty1pnm");

// Helper function to generate the AES key
async function generate_key(date = null) {
  const dateSeq = generate_date_seq(date);
  const keyData = new TextEncoder().encode("qa8y" + dateSeq + "ty1pn");
  return window.crypto.subtle.importKey("raw", keyData, { name: "AES-CBC" }, false, ["encrypt", "decrypt"]);
}

// Helper function to generate the LocalName for the request header
async function generate_local_name(date = null) {
  const randomCharSeq = get_random_char_seq(4);
  const dateSeq = generate_date_seq(date);
  const randomSuffix = get_random_char_seq(5);
  const nameBytes = new TextEncoder().encode(randomCharSeq + dateSeq + randomSuffix);
  const encryptedBytes = await encrypt(nameBytes);

  return base64Encode(encryptedBytes);
}

// Function to encrypt data using AES-CBC
async function encrypt(data) {
  const key = await generate_key();
  const encrypted = await window.crypto.subtle.encrypt({ name: "AES-CBC", iv: IV }, key, data);
  return new Uint8Array(encrypted);
}

// Function to decrypt data using AES-CBC
async function decrypt(data) {
  const key = await generate_key();
  const decrypted = await window.crypto.subtle.decrypt({ name: "AES-CBC", iv: IV }, key, data);
  return new Uint8Array(decrypted);
}

// Function to deserialize the payload (decrypts base64 payload)
async function deserialize_payload(payload) {
  const pbytes = base64Decode(payload);
  const raw = await decrypt(pbytes);
  return JSON.parse(new TextDecoder().decode(raw));
}

// Function to serialize the payload (encrypts and returns base64 string)
async function serialize_payload(payload) {
  const raw = new TextEncoder().encode(JSON.stringify(payload));
  const pbytes = await encrypt(raw);
  return base64Encode(pbytes);
}
