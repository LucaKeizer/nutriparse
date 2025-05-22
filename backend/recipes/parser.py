import re
import spacy
from fractions import Fraction
from django.db.models import Q
from nutrition.models import NutritionData, MeasurementUnit

# Load the spaCy model
nlp = spacy.load('en_core_web_sm')

# Common cooking units
UNITS = {
    # Volume
    'teaspoon': ['tsp', 'teaspoon', 'teaspoons', 't'],
    'tablespoon': ['tbsp', 'tablespoon', 'tablespoons', 'tbs', 'T'],
    'fluid ounce': ['fl oz', 'fluid ounce', 'fluid ounces'],
    'cup': ['c', 'cup', 'cups'],
    'pint': ['pt', 'pint', 'pints'],
    'quart': ['qt', 'quart', 'quarts'],
    'gallon': ['gal', 'gallon', 'gallons'],
    'milliliter': ['ml', 'milliliter', 'milliliters'],
    'liter': ['l', 'liter', 'liters'],
    
    # Weight
    'pound': ['lb', 'lbs', 'pound', 'pounds'],
    'ounce': ['oz', 'ounce', 'ounces'],
    'gram': ['g', 'gram', 'grams'],
    'kilogram': ['kg', 'kilogram', 'kilograms'],
    
    # Count
    'slice': ['slice', 'slices'],
    'piece': ['piece', 'pieces'],
    'handful': ['handful', 'handfuls'],
    'pinch': ['pinch', 'pinches'],
    'dash': ['dash', 'dashes'],
    'bunch': ['bunch', 'bunches'],
    'can': ['can', 'cans'],
    'clove': ['clove', 'cloves'],
}

# Common food preparations
PREPARATIONS = [
    'diced', 'chopped', 'minced', 'sliced', 'grated', 'peeled',
    'crushed', 'ground', 'mashed', 'shredded', 'julienned', 'cubed',
    'trimmed', 'rinsed', 'washed', 'dried', 'cut', 'halved',
]

# Patterns for ingredient parsing
QUANTITY_PATTERN = r'(?:(?:\d+\s+\d+/\d+)|(?:\d+/\d+)|(?:\d*\.?\d+))'
UNIT_PATTERN = '|'.join([re.escape(unit) for sublist in UNITS.values() for unit in sublist])
INGREDIENT_PATTERN = re.compile(
    rf'^(?P<quantity>{QUANTITY_PATTERN})?\s*(?P<unit>(?:{UNIT_PATTERN})\s*)?\s*(?P<ingredient>.+)$', 
    re.IGNORECASE
)


def convert_to_float(fraction_str):
    """Convert a string representation of a fraction to a float"""
    try:
        # Handle mixed numbers like "1 1/2"
        if ' ' in fraction_str:
            whole, frac = fraction_str.split(' ', 1)
            return float(whole) + float(Fraction(frac))
        # Handle fractions like "1/2"
        elif '/' in fraction_str:
            return float(Fraction(fraction_str))
        # Handle decimals and integers
        else:
            return float(fraction_str)
    except (ValueError, ZeroDivisionError):
        return None


def normalize_unit(unit_text):
    """Convert various unit representations to our standard units"""
    if not unit_text:
        return None
    
    unit_text = unit_text.strip().lower()
    
    for standard_unit, variations in UNITS.items():
        if unit_text in variations:
            return standard_unit
    
    return None


def extract_preparation(text):
    """Extract preparation instructions from ingredient text"""
    for prep in PREPARATIONS:
        # Look for preparation terms at the beginning or end of the text
        if text.startswith(f"{prep} "):
            return prep, text[len(prep):].strip()
        if text.endswith(f", {prep}") or text.endswith(f" {prep}"):
            return prep, text[:-(len(prep) + 1)].strip().rstrip(',')
        
        # Look for preparation terms in the middle
        match = re.search(rf', {prep}[,\s]', text)
        if match:
            start, end = match.span()
            return prep, text[:start].strip() + text[end-1:].strip()
    
    return None, text


def parse_ingredient_line(line):
    """Parse a single ingredient line into its components"""
    line = line.strip()
    if not line:
        return None
    
    # Try to match with our ingredient pattern
    match = INGREDIENT_PATTERN.match(line)
    if match:
        quantity_str = match.group('quantity')
        unit_str = match.group('unit')
        ingredient_text = match.group('ingredient').strip()
        
        # Convert quantity to float
        quantity = convert_to_float(quantity_str) if quantity_str else None
        
        # Normalize unit
        unit = normalize_unit(unit_str) if unit_str else None
        
        # Extract preparation method
        preparation, ingredient_text = extract_preparation(ingredient_text)
        
        return {
            'quantity': quantity,
            'unit': unit,
            'ingredient': ingredient_text,
            'preparation': preparation,
            'original_text': line,
        }
    
    # If the pattern doesn't match, just return the original text
    return {
        'quantity': None,
        'unit': None,
        'ingredient': line,
        'preparation': None,
        'original_text': line,
    }


def identify_ingredient_section(text):
    """
    Try to identify the ingredients section in the text.
    Returns a tuple of (ingredients_text, instructions_text)
    """
    # Common section headers
    ingredient_headers = [
        "ingredients:", "ingredients", "you'll need:", "you'll need", 
        "what you'll need:", "what you'll need", "what you need:", "what you need",
    ]
    
    instruction_headers = [
        "instructions:", "instructions", "directions:", "directions", 
        "method:", "method", "preparation:", "preparation", "steps:", "steps",
    ]
    
    # Split the text into lines
    lines = text.split('\n')
    
    # Try to find section headers
    ingredient_start = None
    instruction_start = None
    
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        
        if not ingredient_start:
            for header in ingredient_headers:
                if line_lower == header:
                    ingredient_start = i + 1
                    break
        
        if not instruction_start:
            for header in instruction_headers:
                if line_lower == header:
                    instruction_start = i + 1
                    break
    
    # If we found both sections
    if ingredient_start and instruction_start:
        if ingredient_start < instruction_start:
            ingredients_text = '\n'.join(lines[ingredient_start:instruction_start-1])
            instructions_text = '\n'.join(lines[instruction_start:])
        else:
            instructions_text = '\n'.join(lines[instruction_start:ingredient_start-1])
            ingredients_text = '\n'.join(lines[ingredient_start:])
    # If we only found ingredients
    elif ingredient_start:
        ingredients_text = '\n'.join(lines[ingredient_start:])
        instructions_text = ''
    # If we only found instructions
    elif instruction_start:
        instructions_text = '\n'.join(lines[instruction_start:])
        ingredients_text = '\n'.join(lines[:instruction_start-1])
    # If we didn't find any section headers, try to infer
    else:
        # Use NLP to try to identify ingredients
        doc = nlp(text)
        
        # Identify lines that are likely ingredients (have quantities or food items)
        likely_ingredient_lines = []
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if line contains a number (potential quantity)
            has_number = bool(re.search(r'\d', line))
            
            # Check if line contains a food item or unit
            has_food_term = False
            doc_line = nlp(line)
            for token in doc_line:
                if token.pos_ == 'NOUN' or normalize_unit(token.text):
                    has_food_term = True
                    break
            
            # If line has both a number and food term, it's likely an ingredient
            if has_number and has_food_term and len(line) < 100:
                likely_ingredient_lines.append(line)
        
        # If we found likely ingredients, use them
        if likely_ingredient_lines:
            ingredients_text = '\n'.join(likely_ingredient_lines)
            
            # Instructions are everything else
            instructions_text = text
            for line in likely_ingredient_lines:
                instructions_text = instructions_text.replace(line, '')
        else:
            # As a last resort, just assume the first half is ingredients
            mid_point = len(lines) // 2
            ingredients_text = '\n'.join(lines[:mid_point])
            instructions_text = '\n'.join(lines[mid_point:])
    
    return ingredients_text, instructions_text


def parse_recipe_text(text):
    """Parse recipe text into structured data"""
    result = {}
    
    # Identify ingredients and instructions sections
    ingredients_text, instructions_text = identify_ingredient_section(text)
    
    # Parse ingredient lines
    ingredients = []
    for line in ingredients_text.split('\n'):
        line = line.strip()
        if line:
            parsed = parse_ingredient_line(line)
            if parsed:
                ingredients.append(parsed)
    
    # Add to result
    result['ingredients'] = ingredients
    result['instructions'] = instructions_text.strip()
    
    return result


def match_ingredients_to_foods(parsed_ingredients):
    """Match parsed ingredients to foods in the database"""
    matched_ingredients = []
    
    for ingredient in parsed_ingredients:
        ingredient_text = ingredient['ingredient']
        # Create a copy to add matching information
        matched = ingredient.copy()
        matched['is_parsed'] = False
        
        # Try to find a matching food
        food = None
        
        # First try direct name match
        try:
            food = NutritionData.objects.get(
                Q(name__iexact=ingredient_text) | 
                Q(common_name__iexact=ingredient_text)
            )
        except NutritionData.DoesNotExist:
            # If not found, try partial match
            matches = NutritionData.objects.filter(
                Q(name__icontains=ingredient_text) | 
                Q(common_name__icontains=ingredient_text) |
                Q(search_terms__icontains=ingredient_text)
            )
            
            if matches.exists():
                # Take the first match for now
                food = matches.first()
        
        # If we found a food match
        if food:
            matched['food'] = food
            matched['is_parsed'] = True
            
            # Try to find unit if specified
            if ingredient['unit']:
                try:
                    unit = MeasurementUnit.objects.get(name__iexact=ingredient['unit'])
                    matched['unit'] = unit
                except MeasurementUnit.DoesNotExist:
                    # Unit not found, keep as None
                    matched['unit'] = None
        
        matched_ingredients.append(matched)
    
    return matched_ingredients