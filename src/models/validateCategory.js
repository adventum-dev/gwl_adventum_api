const validateCategory = {
    "title": "Category Validate",
    "description": "Will validate the requests of PGR complaints category",
    "type": "object",
    "properties": {
        "user_name": {
            "description": "It should be text and should be a primary key",
            "type": "string"
        }
    },
    "required": ["user_name"]
}

export default validateCategory;