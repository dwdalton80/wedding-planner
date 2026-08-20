# Validation Notes

## Live dashboard review

The private-link dashboard loaded without a sign-in screen and seeded the required wedding date, Cottonwood Barn venue name, $11,900.00 wedding budget, $5,000.00 honeymoon budget, $3,653.44 venue payment, 21 wedding lines, and six honeymoon lines. The guest scenario table displayed $148.75, $119.00, $95.20, $79.33, and $68.00 for the wedding-only scenario rows at 80, 100, 125, 150, and 175 guests respectively.

## Persistence interaction in progress

The Photographer allocation was changed from $1,350.00 to $1,360.00 in the live browser. The next focus change will verify the database save and rollup refresh, after which the planner will be restored to the approved $8,246.56 starting wedding allocation.

The committed Photographer edit persisted and recalculated the shared plan to $8,256.56, raised the Photography, Services & Entertainment rollup to $2,160.00, and produced a $10.00 budget-overage notice. The restore action returned a success confirmation; the following browser check will confirm the invalidated query has rendered the restored values.

The initial restore request did not reset the persisted Photographer value, which remained at $1,360.00 after refresh. The reset implementation was therefore updated to apply explicit immutable starting amounts and to await the planner-query refresh before presenting a success confirmation. The next interaction will validate this corrected behavior.

The corrected wedding restore successfully returned Photographer to $1,350.00, restored the $8,246.56 wedding allocation, removed the overage notice, and restored the original per-person scenario values. The honeymoon section visually confirmed its six required categories, independent restore control, the Dallas/DFW reminder, and both named external deal-search links.
