<?php

if (!defined('sugarEntry') || !sugarEntry) {
    die('Not A Valid Entry Point');
}

class OpportunitiesCalculateProfit
{

    public function calculateProfit(&$bean, $event, $arguments)
    {
        $bean->calculated_profit = 0;

        if ($bean->sales_stage != 'Closed Won') {
            return;
        }

        global $db;

        $query = "SELECT id FROM aos_quotes WHERE 
                    opportunity_id = '{$bean->id}' AND 
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
        
        $bean->calculated_profit = $total_profit;
    }
}
