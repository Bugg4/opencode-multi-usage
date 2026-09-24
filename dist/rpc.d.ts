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
                    readonly type: "object";
                    readonly properties: {
                        readonly reason: {
                            readonly type: "string";
                        };
                    };
                    readonly required: readonly ["reason"];
                    readonly additionalProperties: false;
                };
            };
        };
    };
    readonly events: {};
};
//# sourceMappingURL=rpc.d.ts.map