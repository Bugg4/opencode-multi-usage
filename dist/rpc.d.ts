export declare const MultiUsageRpc: {
    readonly id: "multi-usage";
    readonly methods: {
        readonly codexUsage: {
            readonly input: {
                readonly type: "object";
                readonly additionalProperties: false;
            };
            readonly output: {
                readonly type: "object";
                readonly properties: {
                    readonly plan: {
                        anyOf: {
                            type: string;
                        }[];
                    };
                    readonly allowed: {
                        anyOf: {
                            type: string;
                        }[];
                    };
                    readonly limitReached: {
                        anyOf: {
                            type: string;
                        }[];
                    };
                    readonly primary: {
                        readonly anyOf: readonly [{
                            type: string;
                            properties: {
                                usedPercent: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                                remainingPercent: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                                windowSeconds: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                                resetAt: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                            };
                            required: string[];
                            additionalProperties: boolean;
                        }, {
                            readonly type: "null";
                        }];
                    };
                    readonly secondary: {
                        readonly anyOf: readonly [{
                            type: string;
                            properties: {
                                usedPercent: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                                remainingPercent: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                                windowSeconds: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                                resetAt: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                            };
                            required: string[];
                            additionalProperties: boolean;
                        }, {
                            readonly type: "null";
                        }];
                    };
                };
                readonly required: readonly ["plan", "allowed", "limitReached", "primary", "secondary"];
                readonly additionalProperties: false;
            };
            readonly errors: {
                readonly unavailable: {
                    type: string;
                    properties: {
                        reason: {
                            type: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
            };
        };
        readonly commandCodeUsage: {
            readonly input: {
                readonly type: "object";
                readonly additionalProperties: false;
            };
            readonly output: {
                type: string;
                properties: {
                    plan: {
                        anyOf: {
                            type: string;
                        }[];
                    };
                    status: {
                        anyOf: {
                            type: string;
                        }[];
                    };
                    daysLeft: {
                        anyOf: {
                            type: string;
                        }[];
                    };
                    monthlyRemaining: {
                        anyOf: {
                            type: string;
                        }[];
                    };
                    extraRemaining: {
                        anyOf: {
                            type: string;
                        }[];
                    };
                    totalRemaining: {
                        anyOf: {
                            type: string;
                        }[];
                    };
                    usagePercent: {
                        anyOf: {
                            type: string;
                        }[];
                    };
                    periodCount: {
                        anyOf: {
                            type: string;
                        }[];
                    };
                    periodCost: {
                        anyOf: {
                            type: string;
                        }[];
                    };
                    fiveHour: {
                        anyOf: ({
                            type: string;
                            properties: {
                                used: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                                cap: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                                resetAt: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                            };
                            required: string[];
                            additionalProperties: boolean;
                        } | {
                            type: string;
                        })[];
                    };
                    weekly: {
                        anyOf: ({
                            type: string;
                            properties: {
                                used: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                                cap: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                                resetAt: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                            };
                            required: string[];
                            additionalProperties: boolean;
                        } | {
                            type: string;
                        })[];
                    };
                    monthly: {
                        anyOf: ({
                            type: string;
                            properties: {
                                used: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                                cap: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                                resetAt: {
                                    anyOf: {
                                        type: string;
                                    }[];
                                };
                            };
                            required: string[];
                            additionalProperties: boolean;
                        } | {
                            type: string;
                        })[];
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            readonly errors: {
                readonly unavailable: {
                    type: string;
                    properties: {
                        reason: {
                            type: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
            };
        };
    };
    readonly events: {};
};
//# sourceMappingURL=rpc.d.ts.map