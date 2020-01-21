Generates a {@link conditionfunc} from a function.

@param condition The function that will be called when the condition is checled. Must return a boolean.

@example
// Only fire this trigger if Player 0 has race human
TriggerAddCondition(someTrigger, () => GetPlayerRace(Player(0)) === race.RACE_HUMAN)

