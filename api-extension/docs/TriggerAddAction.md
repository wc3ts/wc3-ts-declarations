Adds an action (function) that will be executed once a trigger is fired.

@param whichTrigger
The trigger the action will be added to.

@param actionFunc
The function that will execute for this action.
Either a inline anonymous/arrow function or the name/handle of a function.

@returns
A handle to the added action which can be used to remove the action {@link TriggerRemoveAction}.

@example
```typescript
// Kill the unit that fired this trigger
TriggerAddAction(someTrigger, () => KillUnit(GetTriggerUnit()));
```