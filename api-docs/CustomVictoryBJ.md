Declrease a player victorious
and optionally shows the victory dialog (Continue, Quit).

**Related functions:**
* {@link CustomVictoryDialogBJ}
* {@link CustomVictoryQuitBJ}
* {@link CustomVictoryOkBJ}
@param whichPlayer
@param showDialog
@param showScores
 
@example
// Declare the owner of the Killing unit victorious and show victory dialog and scoreboard
CustomVictoryBJ(GetOwningPlayer(GetKillingUnitBJ()), true, true);
 