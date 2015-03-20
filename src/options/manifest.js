// SAMPLE
this.manifest = {
    "name": "Tomato Stand - Verizon",
    "icon": "icon.png",
    "settings": [
		{
            "group": i18n.get("description"),
            "tab": i18n.get("information"),
            "name": "description",
            "type": "description",
            "text": i18n.get("description_text")
        },
        {
			"group": "Fetch settings",
            "tab": i18n.get("information"),
            "name": "days",
            "type": "text",
            "label": i18n.get("days"),
			"default": "7"
        },
        {
			"group": "Fetch settings",
            "tab": i18n.get("information"),
            "name": "channels",
            "type": "text",
            "label": i18n.get("channels"),
			"default": "375, 376, 377, 378, 379, 380, 385, 386, 390, 391, 550, 551, 552, 746, 865, 866, 867, 868, 869, 870, 873, 885, 887, 899, 901, 902, 903, 904, 905, 906, 907, 908, 909, 910, 911"
        }
	],
    "alignment": [
        [
            "days",
            "channels"
        ]
   
    ]
};
