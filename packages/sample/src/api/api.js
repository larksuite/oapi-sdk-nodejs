const lark = require("@larksuiteoapi/allcore");

const appSettings = lark.getInternalAppSettingsByEnv()

const conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {})

let req = lark.api.newRequest("/open-apis/message/v4/send", "POST", lark.api.AccessTokenType.Tenant, {
    user_id: "77bbc392",
    msg_type: "text",
    content: {
        text: "test"
    }
})
req.setTimeoutOfMs(6000)
lark.api.sendRequest(conf, req).then(resp => {
    console.log(resp.getHeader())
    console.log(resp.getRequestID())
    console.log(resp.getHTTPStatusCode())
    console.log(resp) // r = response.body
}).catch(e => {
    console.log(e)
})

// send card message
lark.api.sendRequest(conf, lark.api.newRequest("/open-apis/message/v4/send", "POST", lark.api.AccessTokenType.Tenant, {
    user_id: "77bbc392",
    msg_type: "interactive",
    card: {
        "config": {
            "wide_screen_mode": true
        },
        "i18n_elements": {
            "zh_cn": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "[飞书](https://www.feishu.cn)整合即时沟通、日历、音视频会议、云文档、云盘、工作台等功能于一体，成就组织和个人，更高效、更愉悦。"
                    }
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "深度整合使用率极高的办公工具，企业成员在一处即可实现高效沟通与协作。"
                    },
                    "extra": {
                        "tag": "img",
                        "img_key": "img_e344c476-1e58-4492-b40d-7dcffe9d6dfg",
                        "alt": {
                            "tag": "plain_text",
                            "content": "hover"
                        }
                    }
                },
                {
                    "tag": "action",
                    "actions": [
                        {
                            "tag": "button",
                            "text": {
                                "tag": "plain_text",
                                "content": "主按钮"
                            },
                            "type": "primary",
                            "value": {
                                "key": "primarykey"
                            }
                        },
                        {
                            "tag": "button",
                            "text": {
                                "tag": "plain_text",
                                "content": "次按钮"
                            },
                            "type": "default",
                            "value": {
                                "key": "defaultkey"
                            }
                        },
                        {
                            "tag": "button",
                            "text": {
                                "tag": "plain_text",
                                "content": "危险按钮"
                            },
                            "type": "danger"
                        }
                    ]
                }
            ],
            "en_us": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "Empowering teams by messenger, video conference, calendar, docs, and emails. It's all in one place."
                    }
                },
                {
                    "tag": "action",
                    "actions": [
                        {
                            "tag": "button",
                            "text": {
                                "tag": "plain_text",
                                "content": "Primary Button"
                            },
                            "type": "primary"
                        },
                        {
                            "tag": "button",
                            "text": {
                                "tag": "plain_text",
                                "content": "Secondary Button"
                            },
                            "type": "default"
                        },
                        {
                            "tag": "button",
                            "text": {
                                "tag": "plain_text",
                                "content": "Danger Button"
                            },
                            "type": "danger"
                        }
                    ]
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "Feishu interconnects many essential collaboration tools in a single platform. Always in sync, and easy to navigate."
                    },
                    "extra": {
                        "tag": "img",
                        "img_key": "img_e344c476-1e58-4492-b40d-7dcffe9d6dfg",
                        "alt": {
                            "tag": "plain_text",
                            "content": "hover"
                        }
                    }
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "Feishu automatically syncs data between your devices, so everything you need is always within reach."
                    },
                    "extra": {
                        "tag": "select_static",
                        "placeholder": {
                            "tag": "plain_text",
                            "content": "Enter placeholder text"
                        },
                        "value": {
                            "key": "value"
                        },
                        "options": [
                            {
                                "text": {
                                    "tag": "plain_text",
                                    "content": "Option1"
                                },
                                "value": "1"
                            },
                            {
                                "text": {
                                    "tag": "plain_text",
                                    "content": "Option 2"
                                },
                                "value": "2"
                            },
                            {
                                "text": {
                                    "tag": "plain_text",
                                    "content": "Option 3"
                                },
                                "value": "3"
                            },
                            {
                                "text": {
                                    "tag": "plain_text",
                                    "content": "Option 4"
                                },
                                "value": "4"
                            }
                        ]
                    }
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "With open API, Feishu allows integrating your own apps, existing systems, third-party systems, and quick tools."
                    },
                    "extra": {
                        "tag": "overflow",
                        "options": [
                            {
                                "text": {
                                    "tag": "plain_text",
                                    "content": "Open Feishu App Directory"
                                },
                                "value": "appStore",
                                "url": "https://app.feishu.cn"
                            },
                            {
                                "text": {
                                    "tag": "plain_text",
                                    "content": "View Feishu Developer Docs"
                                },
                                "value": "document",
                                "url": "https://open.feishu.cn"
                            },
                            {
                                "text": {
                                    "tag": "plain_text",
                                    "content": "Open Feishu website"
                                },
                                "value": "document",
                                "url": "https://www.feishu.cn"
                            }
                        ]
                    }
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "With ISO 27001 & 27018 certification, the security of your data is always our top priority."
                    },
                    "extra": {
                        "tag": "date_picker",
                        "placeholder": {
                            "tag": "plain_text",
                            "content": "Please select date"
                        },
                        "initial_date": "2020-9-20"
                    }
                },
                {
                    "tag": "note",
                    "elements": [
                        {
                            "tag": "img",
                            "img_key": "img_e344c476-1e58-4492-b40d-7dcffe9d6dfg",
                            "alt": {
                                "tag": "plain_text",
                                "content": "hover"
                            }
                        },
                        {
                            "tag": "plain_text",
                            "content": "Notes"
                        }
                    ]
                }
            ]
        }
    }
})).then(resp => {
    console.log("--------------------------")
    console.log(resp.getRequestID())
    console.log(resp.getHTTPStatusCode())
    console.log(resp) // r = response.body
}).catch(e => {
    console.log(e)
})

