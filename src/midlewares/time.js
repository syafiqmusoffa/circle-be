"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCreatedAt = formatCreatedAt;
const date_fns_1 = require("date-fns");
function formatCreatedAt(date) {
    return `created ${(0, date_fns_1.formatDistanceToNow)(date, { addSuffix: true })}`;
}
