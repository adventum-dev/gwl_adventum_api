const validateComplaint = {
    "title": "Complain Validate",
    "description": "Will validate the requests of PGR complaints",
    "type": "object",
    "properties": {
        "category_name": {
            "description": "It should be text and name is foreign key from category_details",
            "type": "string",
        },
        "complain_details": {
            "description": "Complain Details",
            "type": ["string", "integer"],
            "minLength": 8
        }
    },
    "required": ["category_name", "complain_details"]
}

export default validateComplaint;