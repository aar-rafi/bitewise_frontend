## POST /api/v1/chat/conversations
Create Conversation
Request body
Schema
{
  "title": "string",
  "extra_data": {
    "additionalProp1": {}
  }
}
201	Successful Response
Schema
{
  "title": "string",
  "extra_data": {
    "additionalProp1": {}
  },
  "id": 0,
  "user_id": 0,
  "status": "active",
  "created_at": "2025-05-27T14:44:14.495Z",
  "updated_at": "2025-05-27T14:44:14.496Z"
}
422	Validation Error
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

## GET /api/v1/chat/conversations
Get Conversations
Parameters
page integer
(query)
minimum: 1
Page number
Default value : 1

page_size integer
(query)
maximum: 100
minimum: 1
Items per page

Default value : 20

status_filter
(query)
Filter by conversation status

status_filter
Responses
200	Successful Response
Schema
{
  "conversations": [
    {
      "id": 0,
      "title": "string",
      "status": "active",
      "created_at": "2025-05-27T15:58:51.944Z",
      "updated_at": "2025-05-27T15:58:51.944Z",
      "last_message_preview": "string",
      "last_message_time": "2025-05-27T15:58:51.944Z",
      "unread_count": 0
    }
  ],
  "total_count": 0,
  "page": 0,
  "page_size": 0,
  "total_pages": 0
}
422	Validation Error
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}


## GET /api/v1/chat/conversations/{conversation_id}
Get Conversation
Parameters
conversation_id integer

Request body
Schema
{
  "title": "string",
  "status": "active",
  "extra_data": {
    "additionalProp1": {}
  }
}
Responses
200	Successful Response
Schema
{
  "title": "string",
  "extra_data": {
    "additionalProp1": {}
  },
  "id": 0,
  "user_id": 0,
  "status": "active",
  "created_at": "2025-05-27T15:36:33.118Z",
  "updated_at": "2025-05-27T15:36:33.118Z"
}
422	Validation Error
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}


## PUT /api/v1/chat/conversations/{conversation_id}
Update Conversation
Parameters
conversation_id integer

Request body
Schema
{
  "title": "string",
  "status": "active",
  "extra_data": {
    "additionalProp1": {}
  }
}
Responses
200	Successful Response
Schema
{
  "title": "string",
  "extra_data": {
    "additionalProp1": {}
  },
  "id": 0,
  "user_id": 0,
  "status": "active",
  "created_at": "2025-05-27T15:36:33.118Z",
  "updated_at": "2025-05-27T15:36:33.118Z"
}
No links
422	Validation Error
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}


## DELETE /api/v1/chat/conversations/{conversation_id}
Delete Conversation
Parameters
conversation_id integer

Request body
Schema
{
  "title": "string",
  "status": "active",
  "extra_data": {
    "additionalProp1": {}
  }
}
Responses
204	Successful Response
"string"
422	Validation Error
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}


## GET /api/v1/chat/conversations/{conversation_id}/messages
Get Conversation Messages
Parameters
conversation_id integer
page integer
page_size integer

Responses
200	Successful Response
Schema
{
  "messages": [
    {
      "content": "string",
      "message_type": "text",
      "attachments": {
        "additionalProp1": {}
      },
      "extra_data": {
        "additionalProp1": {}
      },
      "id": 0,
      "conversation_id": 0,
      "user_id": 0,
      "is_user_message": true,
      "llm_model_id": 0,
      "input_tokens": 0,
      "output_tokens": 0,
      "parent_message_id": 0,
      "reactions": {
        "additionalProp1": {}
      },
      "status": "sent",
      "created_at": "2025-05-27T15:41:05.149Z",
      "updated_at": "2025-05-27T15:41:05.149Z"
    }
  ],
  "total_count": 0,
  "page": 0,
  "page_size": 0,
  "total_pages": 0
}
422	Validation Error
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}


## POST /api/v1/chat/conversations/{conversation_id}/messages
Create Message
Parameters
conversation_id integer

Request body
Schema
{
  "content": "string",
  "message_type": "text",
  "attachments": {
    "additionalProp1": {}
  },
  "extra_data": {
    "additionalProp1": {}
  },
  "parent_message_id": 0
}
Responses
201	Successful Response
Schema
{
  "content": "string",
  "message_type": "text",
  "attachments": {
    "additionalProp1": {}
  },
  "extra_data": {
    "additionalProp1": {}
  },
  "id": 0,
  "conversation_id": 0,
  "user_id": 0,
  "is_user_message": true,
  "llm_model_id": 0,
  "input_tokens": 0,
  "output_tokens": 0,
  "parent_message_id": 0,
  "reactions": {
    "additionalProp1": {}
  },
  "status": "sent",
  "created_at": "2025-05-27T15:43:19.907Z",
  "updated_at": "2025-05-27T15:43:19.907Z"
}
No links
422	Validation Error
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}


## PUT /api/v1/chat/messages/{message_id}
Update Message
Parameters
message_id integer

Request body
Schema
{
  "content": "string",
  "status": "sent",
  "reactions": {
    "additionalProp1": {}
  },
  "extra_data": {
    "additionalProp1": {}
  }
}
Responses
200	Successful Response
Schema
{
  "content": "string",
  "message_type": "text",
  "attachments": {
    "additionalProp1": {}
  },
  "extra_data": {
    "additionalProp1": {}
  },
  "id": 0,
  "conversation_id": 0,
  "user_id": 0,
  "is_user_message": true,
  "llm_model_id": 0,
  "input_tokens": 0,
  "output_tokens": 0,
  "parent_message_id": 0,
  "reactions": {
    "additionalProp1": {}
  },
  "status": "sent",
  "created_at": "2025-05-27T15:44:04.987Z",
  "updated_at": "2025-05-27T15:44:04.987Z"
}
No links
422	Validation Error
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}


## DELETE /api/v1/chat/messages/{message_id}
Delete Message
Parameters
message_id integer

Responses
204	Successful Response
Example Value
"string"

422	Validation Error
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}


## POST /api/v1/chat/chat
Send Chat Message
Parameters
No parameters

Request body
Schema
{
  "message": "string",
  "conversation_id": 0,
  "message_type": "text",
  "attachments": {
    "additionalProp1": {}
  },
  "context": {
    "additionalProp1": {}
  }
}
Responses
201	Successful Response
Schema
{
  "conversation_id": 0,
  "user_message": {
    "content": "string",
    "message_type": "text",
    "attachments": {
      "additionalProp1": {}
    },
    "extra_data": {
      "additionalProp1": {}
    },
    "id": 0,
    "conversation_id": 0,
    "user_id": 0,
    "is_user_message": true,
    "llm_model_id": 0,
    "input_tokens": 0,
    "output_tokens": 0,
    "parent_message_id": 0,
    "reactions": {
      "additionalProp1": {}
    },
    "status": "sent",
    "created_at": "2025-05-27T15:46:02.894Z",
    "updated_at": "2025-05-27T15:46:02.894Z"
  },
  "ai_message": {
    "content": "string",
    "message_type": "text",
    "attachments": {
      "additionalProp1": {}
    },
    "extra_data": {
      "additionalProp1": {}
    },
    "id": 0,
    "conversation_id": 0,
    "user_id": 0,
    "is_user_message": true,
    "llm_model_id": 0,
    "input_tokens": 0,
    "output_tokens": 0,
    "parent_message_id": 0,
    "reactions": {
      "additionalProp1": {}
    },
    "status": "sent",
    "created_at": "2025-05-27T15:46:02.894Z",
    "updated_at": "2025-05-27T15:46:02.894Z"
  },
  "total_tokens_used": 0,
  "cost_estimate": 0
}
422	Validation Error
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}


## POST /api/v1/chat/conversations/{conversation_id}/mark-read
Mark Messages As Read
Parameters
conversation_id integer

Responses
204	Successful Response
"string"
No links
422	Validation Error
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}


## GET /api/v1/chat/conversations/{conversation_id}/summary
Get Conversation Summary
Parameters
conversation_id integer
max_length integer

Responses
200	Successful Response
Schema
{
  "conversation_id": 0,
  "summary": "string",
  "key_topics": [
    "string"
  ],
  "message_count": 0,
  "date_range": {
    "additionalProp1": "2025-05-27T15:48:35.768Z",
    "additionalProp2": "2025-05-27T15:48:35.768Z",
    "additionalProp3": "2025-05-27T15:48:35.768Z"
  }
}
422	Validation Error
Schema
{
  "detail": [
    {
      "loc": [
        "string",
        0
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}