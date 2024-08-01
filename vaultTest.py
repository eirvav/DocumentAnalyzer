from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

#Key Vault name
key_vault_name = "kv-artifact310269004626"
kv_uri = f"https://{key_vault_name}.vault.azure.net/"

# Authenticate to Azure Key Vault
credential = DefaultAzureCredential()
client = SecretClient(vault_url=kv_uri, credential=credential)

#Names of secrets
api_key_secret_name = "docIntelligenceKey"
endpoint_secret_name = "AzureOpenAIEndpoint"

# Retrieve secrets
api_key = client.get_secret(api_key_secret_name).value
endpoint = client.get_secret(endpoint_secret_name).value

# Printing for demo purposes
print(f"API Key: {api_key}")
print(f"Endpoint: {endpoint}")

# Use the secrets in your application