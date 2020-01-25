Removes an action from a trigger.

@param whichTrigger
The trigger this action should be removed from.

@param whichAction
The action to remove. This should eb an action handle returned by {@link TriggerAddAction}

@example
```typescript
const actionHandle = TriggerAddAction(someTrigger, () => {});
TriggerRemoveAction(someTrigger, actionHandle);
```