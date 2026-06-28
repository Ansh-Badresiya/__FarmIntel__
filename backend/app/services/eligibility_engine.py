from typing import Any, Dict, List
from app.models.farmer import Farmer
from app.models.farm import Farm
from app.models.subsidy_scheme import SubsidyScheme
from app.models.eligibility_rule import EligibilityRule

class EligibilityEngine:
    """
    Evaluates JSON-based eligibility rules against Farmer and Farm data.
    Rule logic example: {"field": "land_area", "operator": "<=", "value": 5.0}
    """
    def __init__(self):
        self.operators = {
            "==": lambda a, b: a == b,
            "!=": lambda a, b: a != b,
            ">": lambda a, b: a > b if a is not None and b is not None else False,
            "<": lambda a, b: a < b if a is not None and b is not None else False,
            ">=": lambda a, b: a >= b if a is not None and b is not None else False,
            "<=": lambda a, b: a <= b if a is not None and b is not None else False,
            "in": lambda a, b: a in b if b is not None else False,
            "not_in": lambda a, b: a not in b if b is not None else False,
        }

    def extract_field_value(self, field_name: str, farmer: Farmer, farm: Farm) -> Any:
        """Extracts the value from farmer or farm objects based on field name."""
        if hasattr(farmer, field_name):
            return getattr(farmer, field_name)
        if farm and hasattr(farm, field_name):
            return getattr(farm, field_name)
        return None

    def evaluate_rule(self, rule: EligibilityRule, farmer: Farmer, farm: Farm) -> bool:
        """Evaluates a single eligibility rule."""
        import json
        logic = rule.rule_logic
        if isinstance(logic, str):
            try:
                logic = json.loads(logic)
            except:
                return False
        if not isinstance(logic, dict):
            return False
            
        field = logic.get("field")
        operator = logic.get("operator")
        expected_value = logic.get("value")

        if not field or not operator:
            return False

        actual_value = self.extract_field_value(field, farmer, farm)

        op_func = self.operators.get(operator)
        if not op_func:
            return False

        try:
            return op_func(actual_value, expected_value)
        except Exception:
            return False

    def evaluate_scheme(self, scheme: SubsidyScheme, farmer: Farmer, farm: Farm) -> bool:
        """
        Evaluates all rules for a scheme. 
        Assuming ALL rules must pass for eligibility (AND condition).
        """
        # First, check applicable_states if farmer state is provided
        if scheme.applicable_states and farmer.state:
            if farmer.state not in scheme.applicable_states:
                return False

        # If there are no rules, it's open to everyone (or just depends on state)
        if not scheme.rules:
            return True

        for rule in scheme.rules:
            if not self.evaluate_rule(rule, farmer, farm):
                return False
        
        return True

    def get_eligible_schemes(self, farmer: Farmer, farm: Farm, all_schemes: List[SubsidyScheme]) -> List[SubsidyScheme]:
        """Returns a list of eligible schemes for the given farmer and farm."""
        eligible_schemes = []
        for scheme in all_schemes:
            if self.evaluate_scheme(scheme, farmer, farm):
                eligible_schemes.append(scheme)
        return eligible_schemes
