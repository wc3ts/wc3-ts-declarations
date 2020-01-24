Declare a player victorious
and optionally shows the victory dialog (Continue, Quit).

**Related functions:**
* {@link CustomVictoryDialogBJ}
* {@link CustomVictoryQuitBJ}
* {@link CustomVictoryOkBJ}

@param whichPlayer
The player (and team) that is victorious. TODO verify does this function make everyone on a team win or just asingle person)

@param showDialog
Wether to show a dialog with the header "victory" and a quit/continue button.

@param showScores
Wether to show the scoreboard after leaving the game.
 
@example
```typescript
// Declare the owner of the Killing unit victorious and show victory dialog and scoreboard
CustomVictoryBJ(GetOwningPlayer(GetKillingUnitBJ()), true, true);
 ```