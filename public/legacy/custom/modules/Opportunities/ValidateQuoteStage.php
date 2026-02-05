<?php
/**
 * Validation hook to check if opportunity can be set to "Closed Won"
 * Requires at least one quote with "Closed Accepted" stage
 */
use SuiteCRM\API\v8\Exception\BadRequestException;
use SuiteCRM\LangText;

class OpportunitiesValidateQuoteStage
{
    /**
     * Validate before saving opportunity
     * @param Opportunity $bean
     * @param string $event
     * @param array $arguments
     * @return bool
     */
    public function validateQuoteStage($bean, $event, $arguments)
    {
        // Only check if sales_stage is being set to "Closed Won"
        if (empty($bean->sales_stage) || $bean->sales_stage !== 'Closed Won') {
            return true; // No validation needed
        }

        // Check if this is a new record or if sales_stage changed
        $isNew = empty($bean->id) || empty($bean->fetched_row['sales_stage']);
        $stageChanged = !$isNew && isset($bean->fetched_row['sales_stage']) && 
                       $bean->fetched_row['sales_stage'] !== 'Closed Won';

        // Only validate if it's a new record or stage changed to "Closed Won"
        if (!$isNew && !$stageChanged) {
            return true;
        }

        // Load the relationship to get linked quotes
        $bean->load_relationship('aos_quotes');
        $quotes = $bean->aos_quotes->getBeans();

        $hasClosedAcceptedQuote = false;
        foreach ($quotes as $quote) {
            if (!empty($quote->stage) && $quote->stage === 'Closed Accepted') {
                $hasClosedAcceptedQuote = true;
                break;
            }
        }

        if (!$hasClosedAcceptedQuote) {
            // For Angular UI, we need to throw an exception that can be caught
            // throw new SugarApiExceptionInvalidParameter(
            //     'LBL_OPPORTUNITY_CLOSED_WON_REQUIRES_ACCEPTED_QUOTE'
            // );

            throw new ValidationException("Large opportunities require a description before saving.");
        }

        return true;
    }
}