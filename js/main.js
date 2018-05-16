var players = [];
var numPlayers = 2;
var sets = ["ody", "ody", "ody"];
var dataLoaded = false;
var curPool = 0;
var numOfPools = 3;
var boosters = [];
var curBoosterInPool = 0;
var passDirections = ["left", "right", "left"];

/* ---------------- DATA FUNCTIONS ----------------- */
/* ------------------------------------------------ */
function createPlayers(numOfPlayers) {
	for(i=0; i<numOfPlayers; i++) {
		players[i] = {
			"id": i,
			"name": "Player " + i,
			"picks": [],
			"pickOrder": i,
			"human": false,
			"boosters": [],
			"curBoosterId": null
		}
	}
	players[0].human = true;
} createPlayers(numPlayers);

function getBoosters(set) {
	curBoosterNum = 0;
	numOfBoostersToGet = numOfPools * numPlayers
	for(i=0; i < numOfBoostersToGet; i++){
		$.ajax({
		    url : "https://api.magicthegathering.io/v1/sets/" + set + "/booster",
		    type: "GET",
		    success: function(data, textStatus, jqXHR) {
		    	console.log("Data finished loaded");
		    	boosters[curBoosterNum] = {
		    		"id": curBoosterNum,
		    		"player": null,
		    		"data": data,
		    		"cardsPicked": [],
		    		"pool": null
		    	}

		        // Separate your shit out into parts, don't do anything else here

		        // Check to see if all boosters have been loaded
		        if(curBoosterNum + 1 == numOfBoostersToGet) {
		        	setPools();
		        }

		        curBoosterNum++;
		    },
		    error: function (jqXHR, textStatus, errorThrown) {
		 		console.log("There was an error");
		    }
		});
	}
} getBoosters("ody");

function setPools() {
	var poolNum = 0;
	for(i=0;i<boosters.length;i++) {
		boosters[i].pool = poolNum;
		poolNum++;
		if(poolNum == numOfPools) {
			poolNum = 0;
		}
	}
	setPlayersBoosters();
}
function setPlayersBoosters() {
	for(p=0;p<players.length;p++) {
		var poolNum = 0;
		for(i=0;i<boosters.length;i++) {
			if(boosters[i].pool == poolNum && boosters[i].player == null) {
				boosters[i].player = players[p].id
				players[p].boosters.push(boosters[i].id);

				// If this is the player's first booster, make it current
				if(players[p].boosters.length == 1) {
					players[p].curBoosterId = boosters[i].id;
				}

				poolNum++;
			}

			if(poolNum == numOfPools) {
				i == boosters.length
			}
		}
	}

	// After settings player's boosters, the data is ready
	dataLoaded = true;
	// Once the data is ready, computer's can select their boosters
	computerCardSelector();
}
function rotateBoosters() {
	//console.log("Rotating");
	// Set cur pool to choose from
	// var curPoolBoosters = [];
	// for(i=0;i<boosters.length;i++) {
	// 	if(boosters[i].pool == curPool) {
	// 		curPoolBoosters.push(boosters[i].id);
	// 	}
	// }

	// Pull out all values of booster ID for curBooster for every player
	var boosterIdsPulled = [];
	for(p=0; p<players.length; p++) {
		boosterIdsPulled.push(players[p].curBoosterId);
	}

	if(passDirections[curPool] == "left") {
		var firstId = boosterIdsPulled[0];
		// Shift everything over, append first and make it last:
		boosterIdsPulled.shift();
		boosterIdsPulled.push(firstId);

		// Now update the values for each player:
		var cur = 0;
		for(p=0; p<players.length; p++) {
			players[p].curBoosterId = boosterIdsPulled[cur];
			cur++
			if(cur == boosterIdsPulled.length) {
				cur = 0;
			}
		}

		// Update curBooster
		if(curBoosterInPool + 1 == boosterIdsPulled.length) {
			curBoosterInPool = 0;
		} else {
			curBoosterInPool++;
		}
	}

	computerCardSelector();
}

function computerCardSelector() {
	for(p=0; p<players.length; p++) {
		if(players[p].human == false) {
			playersCurBooster = players[p].curBoosterId;
			//console.log(playersCurBooster)

			var pickableCards = [];

			for(i=0; i<boosters[playersCurBooster].data.cards.length; i++) {
				cardPicked = false;
				for(j=0; j<boosters[playersCurBooster].cardsPicked.length; j++) {
					if(boosters[playersCurBooster].data.cards[i] == boosters[playersCurBooster].cardsPicked[j]) {
						cardPicked = true;
					}
				}

				if(cardPicked == false) {
					pickableCards.push({
						"id": i,
						"data": boosters[playersCurBooster].data.cards[i]
					});
				}
			}

			// Select a card at random for now
			var randomCard = Math.floor(Math.random() * pickableCards.length) + 0 

			// set that card to picked
			boosters[playersCurBooster].cardsPicked.push(randomCard);
			//console.log("Computer player " + players[p].id + " picked: " + randomCard);
		}
	}
}

function setHeights() {
	$(".booster-cards, .player-picks").height($(window).height() - $(".table-headers").height() - 20);
}

/* ------------------ ANIMATIONS ------------------ */
/* ----------------------------------------------- */
$("body").on("mouseenter", ".booster-cards .card", function() {
	$(this).find(".options").transition({y: "30px"}, {duration: 1, complete: function() {
		$(this).css("display", "block").transition({opacity: 1, y: "0px"}, 250);
	}});
});
$("body").on("mouseleave", ".booster-cards .card", function() {
	$(this).find(".options").transition({opacity: 0, y: "30px"}, {duration: 250, complete: function() {
		$(this).css("display", "none");
	}});
});
$("body").on("mouseenter", ".toolbelt-btn", function() {
	$(this).find(".bar-top").stop().transition({y: -2}, {duration: 250});
	$(this).find(".bar-bot").stop().transition({y: 2}, {duration: 250});
});
$("body").on("mouseleave", ".toolbelt-btn", function() {
	$(this).find(".bar-top").stop().transition({y: 0}, {duration: 250});
	$(this).find(".bar-bot").stop().transition({y: 0}, {duration: 250});
});
$("body").on("mouseenter", ".pick-btn", function() {
	$(this).stop().transition({"background-color": "rgba(223,167,74,.9)"}, {duration: 250});
});
$("body").on("mouseleave", ".pick-btn", function() {
	$(this).stop().transition({"background-color": "rgba(223,167,74,.8)"}, {duration: 250});
});
$("body").on("mouseenter", ".card", function() {
	$(this).find(".edge-highlight").css("display", "block");
});
$("body").on("mouseleave", ".card", function() {
	$(this).find(".edge-highlight").css("display", "none");
});
$("body").on("click", ".modal .close", function() {
	$(".modal").css("display", "none");
});

/* --------------- REACT ----------------- */
/* -------------------------------------- */
var Toolbelt = React.createClass({displayName: "toolbelt",
	clickClose: function() {
		$(".toolbelt").removeClass("active").stop().transition({x: $(".toolbelt").width()}, 300);
	},
	render: function() {
		var thisObj = this;
		return(
			React.createElement("div", {className: "toolbelt"},
				React.createElement("div", {className: "header"},
					React.createElement("div", {className: "close", onClick: thisObj.clickClose}, "x")
				),
				React.createElement("div", {className: "body"},
					React.createElement("div", {className: "wrapper"},
						"Loading..."
					)
				)
			)
		);
	}
});

var CardViewer = React.createClass({displayName: "card-viewer",
	render: function() {
		thisObj = this;
		if(thisObj.props.data != undefined) {
			return(
				React.createElement("div", {className: "card-viewer"},
					React.createElement("div", {className: "card-viewer-header"},
						React.createElement("div", {className: "title"},
							"Card Viewer"
						),
						React.createElement("div", {className: "close"},
							"x"
						)
					),
					React.createElement("div", {className: "card-viewer-image"},
						React.createElement(Card, {data: thisObj.props.data})
					)
				)
			);
		} else {
			return(
				React.createElement("div", {className: "card-viewer"},
					React.createElement("div", {className: "card-viewer-header"},
						React.createElement("div", {className: "title"},
							"Card Viewer"
						),
						React.createElement("div", {className: "close"},
							"x"
						)
					),
					React.createElement("div", {className: "card-viewer-image"},
						React.createElement("img", {src: "img/card-back.png"}, null)
					)
				)
			)
		}
	}
});
var Piles = React.createClass({displayName: "piles",
	render: function() {
		thisObj = this;

		var eachPile = thisObj.props.data.map(function(pile, k) {
			return(
				React.createElement(SinglePile, {data: pile, key: k, hoverCard: thisObj.props.hoverCard, hoverLeaveCard: thisObj.props.hoverLeaveCard}, null)
			)
		})

		return(
			React.createElement("div", {className: "piles"}, 
				eachPile
			)
		);
	}
});
var SinglePile = React.createClass({displayName: "single-pile",
	setCardPos: function() {
		var stackY = 21;
		//console.log("setCardPos")
		var tallestPileHeight = null;
		$(".single-pile").each(function() {
			var i = 0;
			$(this).find(".single-pile-cards").find(".card").each(function() {
				$(this).transition({y: stackY * i}, 1);
				i++;
			});

			// New tallest pile?
			thisPileHeight = ($(this).outerWidth() * 1.38) + $(this).find('.single-pile-header').outerHeight() + ((i - 1) * stackY);
			if(thisPileHeight > tallestPileHeight) {
				tallestPileHeight = thisPileHeight;
			}
		});

		// Set heights of all piles to tallest
		$(".single-pile").each(function() {
			$(this).height(tallestPileHeight);
		});
	},
	componentDidMount: function() {
		this.setCardPos();
	},
	componentDidUpdate: function() {
		this.setCardPos();
	},
	render: function() {
		//console.log(thisObj.props.data.cards);
		thisObj = this;

		var eachCard = thisObj.props.data.cards.map(function(card, k) {
			return(
				React.createElement(Card, {data: card, key: k, hoverCard: thisObj.props.hoverCard, hoverLeaveCard: thisObj.props.hoverLeaveCard}, null)
			)
		})

		return(
			React.createElement("div", {className: "single-pile"}, 
				React.createElement("div", {className: "single-pile-header"}, 
					this.props.data.header
				),
				React.createElement("div", {className: "single-pile-cards"}, 
					eachCard
				)
			)
		);
	}
});

var Card = React.createClass({displayName: "card",
	setTemplate: function(color, cardType) {
		if(color[0] != undefined){
			if(color.length == 1) {
		      switch(color[0]){
		        case "White":
		          return "template-white";
		          break
		        case "Blue":
		          return "template-blue";
		          break
		        case "Black":
		          return "template-black";
		          break
		        case "Red":
		          return "template-red";
		          break
		        case "Green":
		          return "template-green";
		          break
		      }
		    } else if(color.length > 1) {
		    	return "template-gold"
		    }
		 } else {
		 	if(cardType = "Land") {
		 		return "template-land"
		 	} else {
	      		return "template-artifact";
	      	}
	    }
	},
	mapText: function(data) {
		var dataReturn = data.map(function (i, k) {
			if(/^{\d}+$/.test(i)) { // {number}
				// Remove curly braces
				i = i.replace("{", "").replace("}", "");
				return(
					React.createElement("div", {key: k, className: "symbol-number"}, i)
				);
			} else if(i == "{W}") { // Green mana symbol
				return(
					React.createElement("img", {key: k, className: "mana-symbol-white", src:"img/mana-symbol-white.png"}, null)
				);
			} else if(i == "{U}") { // Blue mana symbol
				return(
					React.createElement("img", {key: k, className: "mana-symbol-blue", src:"img/mana-symbol-blue.png"}, null)
				);
			} else if(i == "{B}") { // Black mana symbol
				return(
					React.createElement("img", {key: k, className: "mana-symbol-black", src:"img/mana-symbol-black.png"}, null)
				);
			} else if(i == "{R}") { // Red mana symbol
				return(
					React.createElement("img", {key: k, className: "mana-symbol-red", src:"img/mana-symbol-red.png"}, null)
				);
			} else if(i == "{G}") { // Green mana symbol
				return(
					React.createElement("img", {key: k, className: "mana-symbol-green", src:"img/mana-symbol-green.png"}, null)
				);
			} else if(i == "{T}") { // Tap symbol
				return(
					React.createElement("img", {key: k, className: "symbol-tap", src: "img/symbol-tap.png"}, null)
				);
			} else if(i == "\n") { // New line
				return React.createElement("div",{className: "text-space", key: k},i);
			} else { // Regular text
			    return React.createElement("span",{key:k}, i);
			}
		});

		return dataReturn;
	},
	hoverThisCard: function() {
		this.props.hoverCard(this.props.data);
	},
	hoverLeaveThisCard: function() {
		this.props.hoverLeaveCard();
	},
	render: function() {
		thisObj = this;
		/* ---------- BUILD MANA COSTS ---------- */
		/* ------------------------------------- */
		var manaCostsToInsert  = "";
		if(this.props.data.manaCost != undefined) {
			var manaCosts = this.props.data.manaCost;
			var finalManaCosts = manaCosts.split(/({.*?})/g).filter(function(el) { return el !== undefined; });
			manaCostsToInsert = thisObj.mapText(finalManaCosts);
		}
		/* ---------- BUILD POWER/TOUGHNESS ---------- */
		/* ------------------------------------------ */
		var powerToughness = "";
		if(this.props.data.power != undefined && this.props.data.toughness != undefined) {
			powerToughness = this.props.data.power + "/" + this.props.data.toughness;
		}
		/* ---------- BUILD SET SYMBOL ---------- */
		/* ------------------------------------- */
		var cssSet = "ss-" + this.props.data.set.toLowerCase() + " ss-" + this.props.data.rarity.toLowerCase();
		/* ---------- BUILD TEXT ---------- */
		/* ------------------------------- */
		var textToInsert = "";
		//console.log(this.props.data.originalText)
		if(this.props.data.originalText != undefined) {
			var finalText = this.props.data.originalText;
			var finalTextReally = finalText.split(/(\n)|({.*?})/g).filter(function(el) { return el !== ""; });
			textToInsert = thisObj.mapText(finalTextReally);
		}
		/* ---------- BUILD COLORS ---------- */
		/* --------------------------------- */
		var cardColors = [];
		if(this.props.data.colors) {
			cardColors = this.props.data.colors;
		}
		//console.log(this.props.data.colors)
		/* ----- Return ----- */
		return(
			React.createElement("div", {className: "card", value: thisObj.props.id, onMouseEnter: thisObj.hoverThisCard, onMouseLeave: thisObj.hoverLeaveThisCard},
				React.createElement("div", {className: thisObj.setTemplate(cardColors, thisObj.props.data.type)} ),
				React.createElement("div", {className: "title"},
					this.props.data.name
				),
				React.createElement("div", {className: "mana-costs"},
					manaCostsToInsert
				),
				React.createElement("div", {className: "type"},
					this.props.data.type
				),
				React.createElement("div", {className: "text"},
					textToInsert
				),
				React.createElement("div", {className: "power-toughness"},
					powerToughness
				),
				React.createElement("div", {className: "set-symbol"},
					React.createElement("i", {className: "ss " + cssSet}, null)
				),
				React.createElement("img", {className:"card-image", src: this.props.data.imageUrl}),
				React.createElement("div", {className: "edge-highlight"}, null),
				React.createElement("div", {className: "options"},
					React.createElement("div", {className: "pick-btn", onClick: thisObj.props.pickCard}, "Pick Card?")
				)
			)
		);
	}
});

var BoosterCards = React.createClass({displayName: "booster-cards",
	render: function() {
		var thisObj = this;
		// Create the BOOSTER list first
		var cards = thisObj.props.data.data.cards.map(function(card, k) {
			cardWasPicked = false;
			var cardId = null;
			// Check if card has been picked, only show if it hasn't been picked
			for(i=0; i<thisObj.props.data.data.cards.length; i++) {
				if(thisObj.props.data.cardsPicked[i] == k) {
					cardWasPicked = true;
					break
				}
			}
			if(cardWasPicked == false) {
				return(
					React.createElement(Card, {data: card, id: k, hoverCard: thisObj.props.hoverCard, hoverLeaveCard: thisObj.props.hoverLeaveCard, pickCard: thisObj.props.pickCard, key: k}, null)
				);
			}
		});

		return(
			React.createElement("div", {className: "booster-cards"},
				React.createElement("div", {className: "wrapper"},
					cards
				)
			)
		)
	}
});

var PlayerTable = React.createClass({displayName: "table",
	getInitialState: function() {
    	return {player: null, curBooster: null, sortType: "cmc", piles: [], cardHoveredData: null};
  	},
  	componentDidMount: function() {
  		var thisObj = this;
  		var checkData = setInterval(function() {
  			if(dataLoaded == true) {
  				// Right now you are always player 0
  				thisObj.setState({player: players[0]});
  				thisObj.setPiles();
  				clearInterval(checkData);
  			}
  		}, 300);
  		setHeights();
  	},
  	componentDidUpdate: function() {
		setHeights();
  	},
  	pickCard: function(e) {
  		//console.log("Card picked");
  		var pickedCardId = parseInt($(e.currentTarget).closest(".card").attr("value"));
  		boosters[this.state.player.curBoosterId].cardsPicked.push(pickedCardId);
  		this.state.player.picks.push(boosters[this.state.player.curBoosterId].data.cards[pickedCardId]);

  		this.setPiles(boosters[this.state.player.curBoosterId].data.cards[pickedCardId]);

  		// Now go to the next booster
  		this.nextBooster();
  	},
  	nextBooster: function() {
  		rotateBoosters();
  		//console.log("Setting state");
  		this.setState({curBooster: this.state.player.curBooster});
  	},
  	setPiles: function(newPick) {
  		thisObj = this;
  		// Figure out PILES
		var piles = thisObj.state.piles;
		if(thisObj.state.sortType = "cmc") {
			// Figure out what piles we need
			var pileMatch = false;

			// Make sure there is a newPick
			if(newPick != undefined) {
				// Handle cmc of 0
				if(newPick.cmc == undefined) {
					newPick.cmc = 0;
				}

				// Make first pile
				if(piles[0] == undefined) {
					piles.push({
						"header": newPick.cmc,
						"cards": []
					})
				} else {
					// If there's at least one pile...
					for(j=0;j<piles.length;j++) {
						if(newPick.cmc == piles[j].header) {
							pileMatch = true;
						}
					}

					if(pileMatch == false) {
						// Create a new pile
						piles.push({
							"header": newPick.cmc,
							"cards": []
						})
					}
				}
			}

			// Now add new pick to a pile:
			if(newPick != undefined) {
				for(j=0;j<piles.length;j++) {
					if(newPick.cmc == piles[j].header) {
						piles[j].cards.push(newPick);
					}
				}
			}

			// Sort headers
			piles.sort(function(a, b) {
			    return parseFloat(a.header) - parseFloat(b.header);
			});

			// Set State
			this.setState({piles: piles});
		}
  	},
  	hoverCard: function(cardData) {
  		this.setState({cardHoveredData: cardData});
  	},
  	hoverLeaveCard: function() {
  		this.setState({cardHoveredData: null});
  	},
  	render: function() {
  		//console.log("render");
  		var thisObj = this

  		/* ----- CREATE BOOSTER COUNTERS ----- */
  		var boosterCounters = [];
  		for(i=0;i<numPlayers;i++) {
  			var activeState = "inactive";
  			if(i == curBoosterInPool) {
  				activeState = "active";
  			}
			boosterCounters.push(React.createElement("div", {className: "booster-counter " + activeState, key: i}, i + 1));
		}

  		/* ----- CREATE POOL COUNTERS ----- */
  		var poolCounters = [];
  		for(i=0;i<numOfPools;i++) {
  			var activeState = "inactive";
  			if(i == curPool) {
  				activeState = "active";
  			}
			poolCounters.push(React.createElement("div", {className: "pool-counter " + activeState, key: i}, null));
		}

  		if( thisObj.state.player != null ) {
  			return(
  				React.createElement("div", {className: "table"},
  					React.createElement(CardViewer, {data: this.state.cardHoveredData}, null),
  					React.createElement("div", {className: "table-headers"},
  						React.createElement("div", {className: "table-header-booster"},
  							React.createElement("div", {className: "title"},
  								React.createElement("h1", null,
  									"Current Booster"
  								)
  							),
  							React.createElement("div", {className: "booster-counters"},
  								boosterCounters
  							),
  							React.createElement("div", {className: "pool-counters"},
  								poolCounters
  							)
  						),
  						React.createElement("div", {className: "table-header-picks"},
  							React.createElement("div", {className: "title"},
  								React.createElement("h1", null,
  									"Your Picks"
  								)
  							),
  							React.createElement("div", {className: "sort-by"},
  								React.createElement("div", {className: "text"},
  									"Sort By: CMC"
  								)
  							)
  						)
  					),
  					React.createElement(BoosterCards, {data: boosters[thisObj.state.player.curBoosterId], hoverCard: thisObj.hoverCard, hoverLeaveCard: thisObj.hoverLeaveCard, pickCard: this.pickCard}, null),
	  				React.createElement("div", {className: "players-picks"},
	  					React.createElement("div", {className: "wrapper"},
	  						React.createElement(Piles, {data: thisObj.state.piles, hoverCard: thisObj.hoverCard, hoverLeaveCard: thisObj.hoverLeaveCard})
	  					)
	  				)
  				)
  			);
  		} else {
  			return(
  				React.createElement("div", {className: "table"},
  					React.createElement("div", {className: "wrapper loading-screen"},
  						"Generating..."
  					)
  				)
  			);
  		}
	}
});

var App = React.createClass({displayName: "app",
	getInitialState: function() {
    	return {toolBeltData: null};
  	},
  	clickToolbeltBtn: function() {
  		if( $(".toolbelt").hasClass("active") ) {
  			$(".toolbelt").removeClass("active").stop().transition({x: $(".toolbelt").width()}, 300);
  		} else {
  			$(".toolbelt").addClass("active").stop().transition({x: "0px"}, 300);
  		}
  	},
	render: function() {
		console.log("This happened");
		var thisObj = this;
		return(
			React.createElement("div", {className: "app"},
				React.createElement("div", {className: "toolbelt-btn", onClick: thisObj.clickToolbeltBtn},
					React.createElement("div", {className: "bar bar-top"}, null),
					React.createElement("div", {className: "bar bar-mid"}, null),
					React.createElement("div", {className: "bar bar-bot"}, null)
				),
				React.createElement(Toolbelt, {data: thisObj.state.toolBeltData}, null),
				React.createElement(PlayerTable, {data: null}, null)
			)
		)
	}
});

ReactDOM.render(
  React.createElement(App, {pollInterval: 3000}),
  document.getElementById('mtg')
);

$(window).resize(function() {
	setHeights();
})