const API_STATUS = {
    SUCCESS: {
        OK: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NO_CONTENT: 204
    },
    REDIRECTION: {
        MULTIPLE_CHOICES: 300,
        MOVED_PERMANENTLY: 301,
        NOT_FOUND: 302

    },
    CLIENT_ERROR: {
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        PAYMENT_REQUIRED: 402,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405
    },
    SERVER_ERROR: {
        INTERNAL_SERVER_ERROR: 500,
        NOT_IMPLEMENTED: 501,
        BAD_GATEWAY: 502,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504,
        HTTP_VERSION_NOT_SUPPORTED: 505,
        NETWORK_CONNECT_TIMEOUT: 599,
    }

};

const ORDER_STATUS = {
    IN_PROCESS: "In process",
    CANCELLED: "Cancelled",
    PREPERING: "Preparing",
    COMPLETE: "Complete/Paid in full",
    OUT_FOR_DELIVERY: "Out for delivery",
    CLOSED: "Complate/Deliverd/Closed",
    ON_HOLD: "Order is on hold",
    ERROR: "Error"
};

module.exports.API_STATUS = API_STATUS;
module.exports.ORDER_STATUS = ORDER_STATUS;