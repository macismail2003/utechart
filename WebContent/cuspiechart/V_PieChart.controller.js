//*&------------------------------------------------------------------------------------------*
//*& Modified By : Seyed Ismail MAC
//*& Modified On : 06.12.2018
//*& Reference   : APS 746
//*& Transport   : CERK916829
//*& Tag         : MAC06122018 +/-
//*& Purpose     : UTE : Add UTE Today value to graph
//*&------------------------------------------------------------------------------------------*

var oDataCusTS = [];
var oDataSaleTS = [];
var oDataITTS = [];

var oDataChart = {
		'idash' : []
};
var oDataCusTSDESC = [];
var TimeoutFlag = false;

var oJSONColorPalette = [];
oJSONColorPalette.push({
							 'Boxes' : '#1a3cb0',
							 'Reefers' : '#d32424',
							 'Specials' : '#31b000',
							 'Swapbodies' : '#e4de00',
							 'Tanks' : '#ae7bea'
});
sap.ui.controller("cuspiechart.V_PieChart", {



/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf zts_cd_07042017.V_PieChart
*/

	openCustDesc : function(){

		var oTABLECUSTDESC = new sap.ui.table.Table({
			visibleRowCount: 8,
			//columnHeaderVisible : false,
			//width: '300px',
			selectionMode : sap.ui.table.SelectionMode.None
		}).addStyleClass("sapUiSizeCompact tblBorder1");

		oTABLECUSTDESC.addColumn(new sap.ui.table.Column({
			 label: new sap.ui.commons.Label({text: "Type", textAlign: "Left"}).addStyleClass("wraptextcol"),
			 template: new sap.ui.commons.TextView().bindProperty("text", "type").addStyleClass("wraptext"),
			 resizable:false,
			 width:"50px"
		}));

		oTABLECUSTDESC.addColumn(new sap.ui.table.Column({
			 label: new sap.ui.commons.Label({text: "Description", textAlign: "Left"}).addStyleClass("wraptextcol"),
			 template: new sap.ui.commons.TextView().bindProperty("text", "description").addStyleClass("wraptext"),
			 resizable:false,
			 width:"250px"
		}));

	 var oMODELCUSTDESC = new sap.ui.model.json.JSONModel();
	 oMODELCUSTDESC.setData({modelData: oDataCusTSDESC});


	 oTABLECUSTDESC.setModel(oMODELCUSTDESC);
	 //oTABLECUSTDESC.setVisibleRowCount(oDataCusTSDESC.length);
	 oTABLECUSTDESC.bindRows("/modelData");

	 var oDialog1Close = new sap.ui.commons.Button({
			 text : "Close",
			 //styled:false,
			 visible:true,
			 //type:sap.m.ButtonType.Unstyled,
			 //icon: sap.ui.core.IconPool.getIconURI("email"),
			 press:function(oEvent){
				 oDialog1.close();
			 }
	 });

	 if(sap.ui.getCore().byId("idDialog1Desc"))
	 		sap.ui.getCore().byId("idDialog1Desc").destroy();

	 var oDialog1 = new sap.ui.commons.Dialog("idDialog1Desc",{
		 //width : "50%",
		 //height : "400px",
		 showCloseButton : true,
		 modal : false,
		 keepInWindow : true
	 });
		//oDialog1.setTitle("My first Dialog");
		//var oText = new sap.ui.commons.TextView({text: "Hello World!"});
		oDialog1.addContent(new sap.m.FlexBox({direction : "Column",
					items : [oTABLECUSTDESC/*, new sap.m.Label({width : "15px"}), oDialog1Close*/]
		}));
		oDialog1.open();
	},
	onInit: function() {

		var oCurrent = this;

				/* Utilization Monthly Chart Data */

				oModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);
				var urlCus = serviceUrl + "/getSet";

				OData.request({
				      requestUri: urlCus,
				      method: "GET",
				      dataType: 'json',
				      headers:
				       {
				          "X-Requested-With": "XMLHttpRequest",
				          "Content-Type": "application/json; charset=utf-8",
				          "DataServiceVersion": "2.0",
				          "X-CSRF-Token":"Fetch"
				      }
				    },
				    function (data, response){

				busyDialog.close();
					if(data.results.length == 0){

				    		sap.ui.commons.MessageBox.show("No data found",
		                          sap.ui.commons.MessageBox.Icon.WARNING,
		                          "Warning",
		                          [sap.ui.commons.MessageBox.Action.OK],
		                          sap.ui.commons.MessageBox.Action.OK);
				    	}
				    	else{

				    		oDataITTS = [];
				    		oDataChart = {
				    				'idash' : []
				    		};

				    		var oITData = {
				    				"items" : []
				    		};

								var month = "";

								for(var i=0; i<data.results.length; i++){

									oDataITTS.push({});

									// Fix Month

									switch (data.results[i].Month.substr(-2)) {
										case "01":
												month = "Jan";
												break;
										case "02":
												month = "Feb";
												break;
										case "03":
												month = "Mar";
												break;
										case "04":
												month = "Apr";
												break;
										case "05":
												month = "May";
												break;
										case "06":
												month = "Jun";
												break;
										case "07":
												month = "Jul";
												break;
										case "08":
												month = "Aug";
												break;
										case "09":
												month = "Sep";
												break;
										case "10":
												month = "Oct";
												break;
										case "11":
												month = "Nov";
												break;
										case "12":
												month = "Dec";
												break;
										default:
									}

									// Fix Year

									month = month + "'" + data.results[i].Month.substr(2,2);

									data.results[i].Month = month;

								}
								data.results[data.results.length - 1].Month = "Today";	// MAC06122018
								oITData.items = oDataITTS = data.results;

				    		// oITData = {
				    		// 		"items" : [
				    		// 		             {
				    		// 		                 "Month": "Aug '17",
				    		// 		                 "Boxes": "96.30",
				    		// 		                 "Reefers": "95.10",
				    		// 		                 "Specials": "85.20",
								// 										 "Swapbodies": "83.30",
								// 										 "Tanks": "86.70"
				    		// 		             },
								// 								 {
				    		// 		                 "Month": "Sep '17",
				    		// 		                 "Boxes": "96.70",
				    		// 		                 "Reefers": "95.80",
				    		// 		                 "Specials": "85.40",
								// 										 "Swapbodies": "85.40",
								// 										 "Tanks": "86.50"
				    		// 		             },
								// 								 {
				    		// 		                 "Month": "Oct '17",
				    		// 		                 "Boxes": "96.90",
				    		// 		                 "Reefers": "96.30",
				    		// 		                 "Specials": "86.80",
								// 										 "Swapbodies": "88.90",
								// 										 "Tanks": "86.30"
				    		// 		             },
								// 								 {
				    		// 		                 "Month": "Nov '17",
				    		// 		                 "Boxes": "97.20",
				    		// 		                 "Reefers": "96.50",
				    		// 		                 "Specials": "88.90",
								// 										 "Swapbodies": "93.90",
								// 										 "Tanks": "86.30"
				    		// 		             },
								// 								 {
				    		// 		                 "Month": "Dec '17",
				    		// 		                 "Boxes": "97.30",
				    		// 		                 "Reefers": "96.70",
				    		// 		                 "Specials": "89.40",
								// 										 "Swapbodies": "97.30",
								// 										 "Tanks": "86.20"
				    		// 		             },
								// 								 {
				    		// 		                 "Month": "Jan '18",
				    		// 		                 "Boxes": "97.30",
				    		// 		                 "Reefers": "97.30",
				    		// 		                 "Specials": "90.10",
								// 										 "Swapbodies": "93.40",
								// 										 "Tanks": "86.30"
				    		// 		             },
								// 								 {
				    		// 		                 "Month": "Feb '18",
				    		// 		                 "Boxes": "97.40",
				    		// 		                 "Reefers": "97.30",
				    		// 		                 "Specials": "89.70",
								// 										 "Swapbodies": "90.90",
								// 										 "Tanks": "86.70"
				    		// 		             },
								// 								 {
				    		// 		                 "Month": "Mar '18",
				    		// 		                 "Boxes": "97.20",
				    		// 		                 "Reefers": "97.30",
				    		// 		                 "Specials": "90.20",
								// 										 "Swapbodies": "88.20",
								// 										 "Tanks": "87.20"
				    		// 		             },
								// 								 {
 								// 										"Month": "Apr '18",
 								// 										"Boxes": "97.40",
 								// 										"Reefers": "97.70",
 								// 										"Specials": "90.40",
 								// 										"Swapbodies": "87.90",
 								// 										"Tanks": "87.30"
 								// 								},
								// 								{
								// 									 "Month": "May '18",
								// 									 "Boxes": "97.20",
								// 									 "Reefers": "97.80",
								// 									 "Specials": "91.30",
								// 									 "Swapbodies": "86.80",
								// 									 "Tanks": "87.90"
								// 							 },
								// 							 {
								// 									"Month": "Jun '18",
								// 									"Boxes": "97.20",
								// 									"Reefers": "97.60",
								// 									"Specials": "91.00",
								// 									"Swapbodies": "85.90",
								// 									"Tanks": "88.40"
								// 							},
								// 							{
								// 								 "Month": "Jul '18",
								// 								 "Boxes": "97.20",
								// 								 "Reefers": "97.70",
								// 								 "Specials": "91.00",
								// 								 "Swapbodies": "85.10",
								// 								 "Tanks": "88.80"
								// 						 },
				    		// 		        ]
				    		// 		        };


				    		var ITDatajson = new sap.ui.model.json.JSONModel(oITData);

								debugger;

				    		var oVizFrameute = oCurrent.getView().byId("idVizFrameUTE");
								oVizFrameute.setModel(ITDatajson);

								oCurrent.getView().byId("idVizFrameUTE").onAfterRendering = function() {

								if (sap.viz.ui5.controls.VizFrame.prototype.onAfterRendering) {
									sap.viz.ui5.controls.VizFrame.prototype.onAfterRendering.apply(this, arguments);
								}

								if($( "title" )[0])
									$( "title" )[0].innerHTML = "";

								};

				    		oVizFrameute.setVizProperties({
				    			plotArea: {
				    				//colorPalette: d3.scale.category20().range(),
										//colorPalette :  oCurrent.setColorPalette(),
				    				dataLabel: {
				    					showTotal: true
				    				},
										tooltip: {
					    				visible: false
					    			}
				    			},
				    			tooltip: {
				    				visible: true
				    			},
				    			title: {
				    				text: "",
										visible : false
				    			},
				    			valueAxis: {
				    				title: {
											visible : false,
				    					text: "Utilization(%)",
				    				}
				    			},
									categoryAxis: {
				    				title: {
											visible : false,
				    					text: "Month",
				    				}
				    			},
									legendGroup: {
				    				layout: {
				    					position: "bottom",
				    				}
				    			},
				    			// yAxis : {
	                //      scale: {
	                //                fixedRange : true,
	                //                minValue : 100,
	                //                maxValue : 300
				          //     }
				    			//  }
				    		});

				    		oCurrent.setDatasetFeeds('Initial');
								oCurrent.setComboModel();

				    	}
				    	},
						function(err){
					    	 //busyDialog.close();
					    	 //errorfromServer(err);
					    	 //alert("Error in data read from SAP");
					    });

	},

	setDatasetFeeds : function(productkeys){
		var oCurrent = this;
		var oVizFrameute = oCurrent.getView().byId("idVizFrameUTE");



		if(productkeys == 'Initial'){

					var oUTEDataset = new sap.viz.ui5.data.FlattenedDataset({
						dimensions: [{
							name: "Month",
							value: "{Month}"
						}],

						measures: [{
							name: "Boxes",
							value: "{Boxes}"
						}, {
							name: "Reefers",
							value: "{Reefers}"
						}, {
							name: "Specials",
							value: "{Specials}"
						},{
							name: "Swapbodies",
							value: "{Swapbodies}"
						},{
							name: "Tanks",
							value: "{Tanks}"
						}],

						data: {
							path: "/items"
						}
					});

					oVizFrameute.setDataset(oUTEDataset);

					var oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
							"uid": "valueAxis",
							"type": "Measure",
							"values": ["Boxes"],
						}),
						oFeedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
							"uid": "valueAxis",
							"type": "Measure",
							"values": ["Reefers"],
						}),
						oFeedValueAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
							"uid": "valueAxis",
							"type": "Measure",
							"values": ["Specials"],
						}),
						oFeedValueAxis3 = new sap.viz.ui5.controls.common.feeds.FeedItem({
							"uid": "valueAxis",
							"type": "Measure",
							"values": ["Swapbodies"],
						}),
						oFeedValueAxis4 = new sap.viz.ui5.controls.common.feeds.FeedItem({
							"uid": "valueAxis",
							"type": "Measure",
							"values": ["Tanks"],
						}),

						oFeedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
									"uid": "categoryAxis",
									"type": "Dimension",
									"values": ["Month"]
						 });

					oVizFrameute.addFeed(oFeedValueAxis);
					oVizFrameute.addFeed(oFeedValueAxis1);
					oVizFrameute.addFeed(oFeedValueAxis2);
					oVizFrameute.addFeed(oFeedValueAxis3);
					oVizFrameute.addFeed(oFeedValueAxis4);
					oVizFrameute.addFeed(oFeedCategoryAxis);

	}/*else if(productkeys == 'All'){

				var oUTEDataset = new sap.viz.ui5.data.FlattenedDataset({
					dimensions: [{
						name: "Date",
						value: "{Month}"
					}],

					measures: [{
						name: "Boxes",
						value: "{Boxes}"
					}, {
						name: "Reefers",
						value: "{Reefers}"
					}, {
						name: "Specials",
						value: "{Specials}"
					},{
						name: "Swapbodies",
						value: "{Swapbodies}"
					},{
						name: "Tanks",
						value: "{Tanks}"
					}],

					data: {
						path: "/items"
					}
				});

				oVizFrameute.setDataset(oUTEDataset);

				var oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["Boxes"],
					}),
					oFeedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["Reefers"],
					}),
					oFeedValueAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["Specials"],
					}),
					oFeedValueAxis3 = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["Swapbodies"],
					}),
					oFeedValueAxis4 = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["Tanks"],
					}),

					oFeedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
								"uid": "categoryAxis",
								"type": "Dimension",
								"values": ["Date"]
					 });

				var feeds = [oFeedValueAxis, oFeedValueAxis1, oFeedValueAxis2, oFeedValueAxis3,
											oFeedValueAxis4, oFeedCategoryAxis];
				oVizFrameute.vizUpdate({'feeds' : feeds});
				// oVizFrameute.addFeed(oFeedValueAxis);
				// oVizFrameute.addFeed(oFeedValueAxis1);
				// oVizFrameute.addFeed(oFeedValueAxis2);
				// oVizFrameute.addFeed(oFeedValueAxis3);
				// oVizFrameute.addFeed(oFeedValueAxis4);
				// oVizFrameute.addFeed(oFeedCategoryAxis);

}*/else{

		var oUTEDataset = new sap.viz.ui5.data.FlattenedDataset({
			dimensions: [{
				name: "Month",
				value: "{Month}"
			}],

			// measures: [{
			// 	name: productkeys,
			// 	value: "{" + productkeys + "}"
			// }],

			data: {
				path: "/items"
			}
		});

		for(var j=0; j<productkeys.length; j++){
			oUTEDataset.addMeasure(new sap.viz.ui5.data.MeasureDefinition({
					name: productkeys[j],
					value: "{" + productkeys[j] + "}"
			}));
		}

		oVizFrameute.setDataset(oUTEDataset);
		 var oFeedValueAxis = null;
		 var feeds = [];
		 for(var j=0; j<productkeys.length; j++){
			 oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": productkeys[j],
				});
				feeds.push(oFeedValueAxis);
			}

			var oFeedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "categoryAxis",
						"type": "Dimension",
						"values": ["Month"]
			 });
			 feeds.push(oFeedCategoryAxis);
			 //var feeds = [oFeedValueAxis, oFeedCategoryAxis];
	 		 oVizFrameute.vizUpdate({'feeds' : feeds});
		// oVizFrameute.addFeed(oFeedValueAxis);
		// oVizFrameute.addFeed(oFeedCategoryAxis);

	}

	oCurrent.getMaxMinValue(productkeys);

},


/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf zts_cd_07042017.V_PieChart
*/
	onBeforeRendering: function() {

		/*var ocus = new cus();
		var cuschart = ocus.createCusPage();

		var osales = new sales();
		var saleschart = new sap.m.Button({
     	   text : "Full Dashboard",
    	   type : sap.m.ButtonType.Unstyled,
    	   press : function(){
    		   oCurrent.openSalesDash();
    	   }
       }).addStyleClass("submitBtn");//osales.createSalesPage();

		var jsonCharts = [cuschart, saleschart];


		//var oCarouselTeaser = sap.ui.getCore().byId("idCarouselTeaser");
		var oCarouselTeaser = this.getView().byId("idCarouselTeaser");
		//oCarouselTeaser.setActivePage(jsonCharts[0]);
		//oCarouselTeaser.setLoop(true);
		oCarouselTeaser.insertPage(jsonCharts[0]);
		oCarouselTeaser.insertPage(jsonCharts[1]);*/
	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf zts_cd_07042017.V_PieChart
*/

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf zts_cd_07042017.V_PieChart
*/
	onExit: function() {

	},

	onSelect : function(oEvent){
		var oCurrent = this;
		var productkeys = oEvent.getSource().getSelectedKeys();
		//var regiontext = oEvent.getParameters("selectedItem").selectedItem.getProperty("text");
		oDataChart.idash = [];
		oCurrent.setDatasetFeeds(productkeys);

		oCurrent.getView().byId("idVizFrameUTE").getModel().updateBindings();
		return;


	},

	opendash : function(){
		window.open("http://sappboci.seaco.com:8080/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AQzakHGcK7VBi9kqQyI3CwY");
	},

	opensale : function(){
		window.open("http://sappboci.seaco.com:8080/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AczxpRnQEphMgyvW.lMKqn8");
	},

	openproducts : function(){
		window.open("http://sappboci.seaco.com:8080/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AThMzy8TjMtNj3LeV3.lSLM");
	},

	openit : function(){
		window.open("https://seaco.sharepoint.com/Departments/IT/EUS/itdashboard/SitePages/Home.aspx");
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf zts_cd_07042017.V_PieChart
*/
	onAfterRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf zts_cd_07042017.V_PieChart
*/
	setComboModel : function() {

		var ddlProductData = [];
		// ddlProductData.push({
		// 	key : 'All',
		// 	text : 'All'
		// });

		ddlProductData.push({
			key : 'Boxes',
			text : 'Boxes'
		});

		ddlProductData.push({
			key : 'Reefers',
			text : 'Reefers'
		});

		ddlProductData.push({
			key : 'Specials',
			text : 'Specials'
		});

		ddlProductData.push({
			key : 'Swapbodies',
			text : 'Swapbodies'
		});

		ddlProductData.push({
			key : 'Tanks',
			text : 'Tanks'
		});

		var oDdlProductModel = new sap.ui.model.json.JSONModel();
    oDdlProductModel.setSizeLimit(99999);
    oDdlProductModel.setData({data:ddlProductData});

    var oComboProduct = this.getView().byId("idComboProduct");
    oComboProduct.setModel(oDdlProductModel);
    oComboProduct.bindItems("/data", new sap.ui.core.ListItem({text: "{text}", key:"{key}"}));
    oComboProduct.setSelectedKeys([ddlProductData[0].key,
																	 ddlProductData[1].key,
																 	ddlProductData[2].key,
																	ddlProductData[3].key,
																	ddlProductData[4].key]);


	},

	getDistinctRegions : function(input){
		var flags = [], output = [], l = input.length, i;
		for( i=0; i<l; i++) {
		    if( flags[input[i].Region]) continue;
		    flags[input[i].Region] = true;
		    output.push(input[i].Region);
		}

		return output;
	},

	getComposition : function(nbv, region){

		var compos = 0.00;

		if(region == "All"){
			for(var j=0; j<oDataCusTS.length; j++){
					compos = compos + parseFloat(oDataCusTS[j].NBV);
			}
		}else{
			for(var j=0; j<oDataCusTS.length; j++){
				if(oDataCusTS[j].Region == region){
					compos = compos + parseFloat(oDataCusTS[j].NBV);
				}
			}
		}

		compos = ( nbv / compos ) * 100;
		compos = thousandsep(compos);
		return compos;
	},

	getMaxMinValue : function(productkeys){
		var minMaxValue = [];
		var lowest = Number.POSITIVE_INFINITY;
		var highest = Number.NEGATIVE_INFINITY;
		var tmp;
		var oLocalJSONColorPalette = [];

		if(productkeys == "Initial"){
				productkeys = ["Boxes", "Reefers", "Specials", "Swapbodies", "Tanks"];
		}

		// Set Color colorPalette
		for(var j=0; j<productkeys.length; j++){
			oLocalJSONColorPalette.push(oJSONColorPalette[0][productkeys[j]]);
		}

		// if(productkeys != "All" && productkeys != "Initial"){

			for (var i=oDataITTS.length-1; i>=0; i--) {
				for(var j=0; j<productkeys.length; j++){
			    tmp = oDataITTS[i][productkeys[j]];
			    if (tmp < lowest) lowest = tmp;
			    if (tmp > highest) highest = tmp;
				}
				minMaxValue.push(lowest);
				minMaxValue.push(highest);
			}


	// }else{
	//
	// 	for (var i=oDataITTS.length-1; i>=0; i--) {
	// 			tmp = oDataITTS[i]["Boxes"];
	// 			if (tmp < lowest) lowest = tmp;
	// 			if (tmp > highest) highest = tmp;
	// 	}
	// 	minMaxValue.push(lowest);
	// 	minMaxValue.push(highest);
	//
	//
	// 	for (var i=oDataITTS.length-1; i>=0; i--) {
	// 			tmp = oDataITTS[i]["Reefers"];
	// 			if (tmp < lowest) lowest = tmp;
	// 			if (tmp > highest) highest = tmp;
	// 	}
	// 	minMaxValue.push(lowest);
	// 	minMaxValue.push(highest);
	//
	// 	for (var i=oDataITTS.length-1; i>=0; i--) {
	// 			tmp = oDataITTS[i]["Specials"];
	// 			if (tmp < lowest) lowest = tmp;
	// 			if (tmp > highest) highest = tmp;
	// 	}
	// 	minMaxValue.push(lowest);
	// 	minMaxValue.push(highest);
	//
	// 	for (var i=oDataITTS.length-1; i>=0; i--) {
	// 			tmp = oDataITTS[i]["Swapbodies"];
	// 			if (tmp < lowest) lowest = tmp;
	// 			if (tmp > highest) highest = tmp;
	// 	}
	// 	minMaxValue.push(lowest);
	// 	minMaxValue.push(highest);
	//
	// 	for (var i=oDataITTS.length-1; i>=0; i--) {
	// 			tmp = oDataITTS[i]["Tanks"];
	// 			if (tmp < lowest) lowest = tmp;
	// 			if (tmp > highest) highest = tmp;
	// 	}
	// 	minMaxValue.push(lowest);
	// 	minMaxValue.push(highest);
	// 	}
		minMaxValue.sort();
		var oCurrent = this;
		var oVizFrameute = oCurrent.getView().byId("idVizFrameUTE");

		var minScale = parseInt( minMaxValue[0]) - 1;
		var maxScale = parseInt( minMaxValue[minMaxValue.length - 1]) + 1;

		oVizFrameute.setVizProperties({
			plotArea: {
				//colorPalette: d3.scale.category20().range(),
				colorPalette :  oLocalJSONColorPalette,
				dataLabel: {
					showTotal: true
				},
				tooltip: {
					visible: false
				}
			},
			yAxis : {
					 scale: {
										 fixedRange : true,
										 minValue : minScale,
										 maxValue : maxScale
					}
			 }
		});

	},

	  pageChanged: function() {
        //setTimeout(function() { sap.ui.getCore().byId("idV_PieChart1--idCarouselTeaser").next(); }, 2000);
				//window.setInterval(CheckIdleTime, 2000);
      }

});
