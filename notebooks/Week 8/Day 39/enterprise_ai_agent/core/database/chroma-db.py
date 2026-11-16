import chromadb

COLLECTION_NAME = "restaurant_vector_db"

chroma_client = chromadb.PersistentClient(path="./")
collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)
