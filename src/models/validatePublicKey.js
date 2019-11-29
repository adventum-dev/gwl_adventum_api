const validatePublickey = {
    "title": "Public Key Validate",
    "description": "Will validate the requests of PGR public key",
    "type": "object",
    "properties": {
        "user_uuid": {
            "description": "It should be text name of user",
            "type": "text"
        },
        "status": {
            "description": "It should be time in number(milliseconds)",
            "type": "text"
        }
    },
    "required": ["user_uuid","status"]
}

export default validatePublickey;