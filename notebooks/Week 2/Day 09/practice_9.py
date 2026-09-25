def shout(func):
    def wrapper(*args):
        result = func(*args)
        return result.upper()
    return wrapper

@shout
def greet(name):
    return f"Hello, {name}!"
print(greet("Alice"))  # Output: "HELLO, ALICE!"



# self