<?php
/**
 * Advanced OpenSales, Advanced, robust set of sales modules.
 * @package Advanced OpenSales for SugarCRM
 * @copyright SalesAgility Ltd http://www.salesagility.com
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU AFFERO GENERAL PUBLIC LICENSE
 * along with this program; if not, see http://www.gnu.org/licenses
 * or write to the Free Software Foundation,Inc., 51 Franklin Street,
 * Fifth Floor, Boston, MA 02110-1301  USA
 *
 * @author SalesAgility <info@salesagility.com>
 */

require_once('include/MVC/Controller/SugarController.php');

#[\AllowDynamicProperties]
class AOS_QuotesController extends SugarController
{
    public function action_editview()
    {
        global $mod_string;

        $this->view = 'edit';
        $GLOBALS['view'] = $this->view;

        if (isset($_REQUEST['aos_invoices_id'])) {
            $query = "SELECT * FROM aos_invoices WHERE id = '?'";
            $result = $this->bean->db->pQuery($query, [$_REQUEST['aos_invoices_id']]);
            $row = $this->bean->db->fetchByAssoc($result);
            $this->bean->name = $row['name'];

            if (isset($row['billing_account_id'])) {
                $_REQUEST['account_id'] = $row['billing_account_id'];
            }

            if (isset($row['billing_contact_id'])) {
                $_REQUEST['contact_id'] = $row['billing_contact_id'];
            }
        }

        if (isset($_REQUEST['aos_contracts_id'])) {
            $query = "SELECT * FROM aos_contracts WHERE id = '?'";
            $result = $this->bean->db->pQuery($query, [$_REQUEST['aos_contracts_id']]);
            $row = $this->bean->db->fetchByAssoc($result);
            $this->bean->name = $row['name'];

            if (isset($row['contract_account_id'])) {
                $_REQUEST['account_id'] = $row['contract_account_id'];
            }

            if (isset($row['opportunity_id'])) {
                $_REQUEST['opportunity_id'] = $row['opportunity_id'];
            }
        }

        if (isset($_REQUEST['account_id'])) {
            $query = "SELECT * FROM accounts WHERE id = '?'";
            $result = $this->bean->db->pQuery($query, [$_REQUEST['account_id']]);
            $row = $this->bean->db->fetchByAssoc($result);
            if ($row) {
                $this->bean->billing_account_id = $row['id'];
                $this->bean->billing_account = $row['name'];
                $this->bean->billing_address_street = $row['billing_address_street'];
                $this->bean->billing_address_city = $row['billing_address_city'];
                $this->bean->billing_address_state = $row['billing_address_state'];
                $this->bean->billing_address_postalcode = $row['billing_address_postalcode'];
                $this->bean->billing_address_country = $row['billing_address_country'];
                $this->bean->shipping_address_street = $row['shipping_address_street'];
                $this->bean->shipping_address_city = $row['shipping_address_city'];
                $this->bean->shipping_address_state = $row['shipping_address_state'];
                $this->bean->shipping_address_postalcode = $row['shipping_address_postalcode'];
                $this->bean->shipping_address_country = $row['shipping_address_country'];
            }
        }

        if (isset($_REQUEST['contact_id'])) {
            $query = "SELECT id, first_name, last_name FROM contacts WHERE id = '?'";
            $result = $this->bean->db->pQuery($query, [$_REQUEST['contact_id']]);
            $row = $this->bean->db->fetchByAssoc($result);
            if ($row) {
                $this->bean->billing_contact_id = $row['id'];
                $this->bean->billing_contact = $row['first_name'] . ' ' . $row['last_name'];
            }

        }

        if (isset($_REQUEST['opportunity_id'])) {
            $query = "SELECT id, name FROM opportunities WHERE id = '?'";
            $result = $this->bean->db->pQuery($query, [$_REQUEST['opportunity_id']]);
            $row = $this->bean->db->fetchByAssoc($result);
            if ($row) {
                $this->bean->opportunity_id = $row['id'];
                $this->bean->opportunity = $row['name'];
            }
        }
    }

    /**
     * Action to check if another quote already has "Closed Accepted" stage
     * Returns JSON: {"exists": true/false, "count": number}
     */
    public function action_CheckFinalQuote()
    {
        $opportunityId = isset($_REQUEST['opportunity_id']) ? $_REQUEST['opportunity_id'] : '';
        $currentQuoteId = isset($_REQUEST['current_quote_id']) ? $_REQUEST['current_quote_id'] : '';
        
        header('Content-Type: application/json');
        
        if (empty($opportunityId)) {
            echo json_encode(array('exists' => false, 'count' => 0));
            exit();
        }
        
        global $db;
        
        $finalStage = 'Closed Accepted';
        $opportunityIdQuoted = $db->quoted($opportunityId);
        $currentQuoteIdQuoted = !empty($currentQuoteId) ? $db->quoted($currentQuoteId) : "''";
        $finalStageQuoted = $db->quoted($finalStage);
        
        // Count all quotes with "Closed Accepted" stage for this opportunity (excluding current quote)
        $query = "SELECT COUNT(*) as count 
                  FROM aos_quotes 
                  WHERE opportunity_id = {$opportunityIdQuoted} 
                    AND id != {$currentQuoteIdQuoted}
                    AND stage = {$finalStageQuoted}
                    AND deleted = 0";
        
        $result = $db->query($query);
        $row = $db->fetchByAssoc($result);
        
        $count = isset($row['count']) ? (int)$row['count'] : 0;
        $exists = $count > 0;
        
        // If we're setting the current quote to "Closed Accepted", add 1 to the count
        // This gives us the total count that would exist after saving
        $totalCount = $count + 1;
        
        echo json_encode(array('exists' => $exists, 'count' => $count, 'totalCount' => $totalCount));
        exit();
    }

    /**
     * Action to check if opportunity is "Closed Won"
     * Returns JSON: {"isClosedWon": true/false}
     */
    public function action_CheckOpportunityStatus()
    {
        $opportunityId = isset($_REQUEST['opportunity_id']) ? $_REQUEST['opportunity_id'] : '';
        
        header('Content-Type: application/json');
        
        if (empty($opportunityId)) {
            echo json_encode(array('isClosedWon' => false));
            exit();
        }
        
        $opportunity = BeanFactory::getBean('Opportunities', $opportunityId);
        $isClosedWon = false;
        
        if ($opportunity && !empty($opportunity->sales_stage) && 
            $opportunity->sales_stage === 'Closed Won') {
            $isClosedWon = true;
        }
        
        echo json_encode(array('isClosedWon' => $isClosedWon));
        exit();
    }
}
