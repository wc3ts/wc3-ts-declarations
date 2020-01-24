Generates a {@link conditionfunc} from a function.
Usally passed to {@link TriggerAddCondition}.

@param condition
The function that will be called when the condition is checked.
Must return a boolean.

@example
// Only fire a trigger if Player 0 has race human
TriggerAddCondition(someTrigger, Condition(() => GetPlayerRace(Player(0)) === race.RACE_HUMAN))

