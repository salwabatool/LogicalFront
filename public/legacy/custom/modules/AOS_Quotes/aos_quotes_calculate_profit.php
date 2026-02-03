<?php

if (!defined('sugarEntry') || !sugarEntry) {
    die('Not A Valid Entry Point');
}

class AOS_QuotesCalculateProfit
{
    public function calculateProfit(&$bean, $event, $arguments)
    {
        $GLOBALS['log']->fatal('Fuzy 1 Calculating profit for quote: ' . print_r($bean, true));

        if ($bean->stage != 'Closed Accepted') {
            return;
        }

        $oppo_id = $bean->opportunity_id;
        $oppo_bean = BeanFactory::getBean('Opportunities', $oppo_id);

        $oppo_bean->calculated_profit = 0;

        if ($oppo_bean->sales_stage != 'Closed Won') {
            return;
        }

        global $db;

        $query = "SELECT id FROM aos_quotes WHERE 
                    opportunity_id = '{$oppo_bean->id}' AND 
                    stage LIKE 'Closed Accepted'";
        $result = $db->query($query);
        $quote = $db->fetchByAssoc($result);

        $query2 = "SELECT product_total_price FROM aos_products_quotes WHERE 
                        parent_id = '{$quote['id']}' AND deleted = 0 AND 
                        parent_type = 'aos_quotes' AND product_id = '0'";
        $result2 = $db->query($query2);
        $total_price_services = 0;
        while ($row = $db->fetchByAssoc($result2)) {
            $total_price_services += $row['product_total_price'];
        }

        $query3 = "SELECT product_total_price FROM aos_products_quotes WHERE 
                        parent_id = '{$quote['id']}' AND deleted = 0 AND 
                        parent_type = 'aos_quotes' AND product_id != '0'";
        $result3 = $db->query($query3);
        $total_price_products = 0;
        while ($row = $db->fetchByAssoc($result3)) {
            $total_price_products += $row['product_total_price'];
        }

        // 50% profit on the total price of the services
        $total_profit_services = $total_price_services / 3;

        // 50% profit on the total price of the products
        $total_profit_products = $total_price_products / 2;

        $total_profit = $total_profit_services + $total_profit_products;

        // round to 2 decimal places
        $total_profit = round($total_profit, 2);
        
        // $oppo_bean->calculated_profit = $total_profit;
        // $oppo_bean->save();
        $queryf = "UPDATE opportunities SET calculated_profit = '{$total_profit}' WHERE id = '{$oppo_id}'";
        $db->query($queryf);
        
    }
}