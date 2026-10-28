#!/usr/bin/env python3
"""Generate detector.ts with multi-language support."""
import re

# Read the existing detector.ts to get the Rule interface and existing rules
with open("src/lib/detector.ts", "r") as f:
    detector = f.read()

# Read languages.ts to get the language rule arrays
with open("src/lib/languages.ts", "r") as f:
    languages = f.read()

# Find all language rule arrays: export const XXX_RULES: LanguageRule[] = [...]
# We need to convert LanguageRule[] (string patterns) to RegExp[] (compiled patterns)
# First, extract the languages module's rule constants

# Find the language rule blocks
lang_blocks = re.findall(r'export const ([A-Z_]+)_RULES: LanguageRule\[\] = \[(.*?)\];', languages, re.DOTALL)

# Build RegExp arrays for each language
reg_exp_blocks = []
for const_name, block in lang_blocks:
    # Extract string patterns from the block
    patterns = re.findall(r'"((?:[^"\\]|\\.)*)"', block)
    patterns = [p for p in patterns if not p.startswith("//") and p.strip() != ""]
    
    # Escape backslashes for RegExp strings
    escaped_patterns = []
    for p in patterns:
        # Replace \ with \\ in the pattern
        escaped = p.replace("\\", "\\\\")
        escaped_patterns.append(f'      /{escaped}/gi,')
    
    reg_exp_blocks.append(f"// {const_name}: {len(patterns)} patterns")
    reg_exp_blocks.append(f"const {const_name} = [")
    reg_exp_blocks.extend(escaped_patterns)
    reg_exp_blocks.append("];")

# Build the new detector.ts
# We need to:
# 1. Add import for language rules
# 2. Merge language rules with existing rules
# 3. Keep the rest of the file

# Find the position where rules array is defined
rules_def_pos = detector.find("const rules: Rule[] = [")
if rules_def_pos == -1:
    print("ERROR: Could not find rules definition")
    exit(1)

# Find the closing "];"
rules_close_pos = detector.find("];", rules_def_pos)

if rules_close_pos == -1:
    print("ERROR: Could not find closing bracket for rules")
    exit(1)

# Build the new file
new_file = detector[:rules_def_pos]

# Add import for language rules
new_file += "\n"
new_file += "import { ENGLISH_RULES, HI_RULES } from './languages';\n"
new_file += "\n"

# Building the merged rules array
new_file += "const rules: Rule[] = [\n"

# Add English rules from detector.ts (they're already in the file)
# We need to find them and extract them
# The prefix (detector[:rules_def_pos]) contains the Rule interface and the start of rules array
# We'll keep the existing rules from detector.ts...

# Actually, let me take a simpler approach: use the existing rules from detector.ts as-is
# and add the language rules at the end

# The prefix (detector[:rules_def_pos]) ends with the start of rules array
# So we need to insert language rules after the existing rules

# Find where the rules array content ends (before the closing ];)
rules_content_start = detector.find("[", rules_def_pos)
rules_content_end = detector.find("];", rules_def_pos)

existing_rules = detector[rules_content_start:rules_content_end]
existing_rules = existing_rules.rstrip()  # Remove trailing whitespace

# Build the merged rules array
new_file += detector[rules_def_pos:rules_content_start]  # "const rules: Rule[] = ["
new_file += existing_rules  # existing rules
new_file += "\n"  # closing bracket of merged array

# Add language rules as separate const arrays (after the merged rules)
new_file += "  // Language-specific rule sets\n"
for block in reg_exp_blocks:
    new_file += f"  // Language: {block.split(':')[0]}\n"
    new_file += f"  const {block.split(':')[0]} = [\n"
    # Count patterns in the block
    pattern_lines = block.split('\n')
    for line in pattern_lines:
        if line.strip().startswith('/') and ']' not in line:
            new_file += f"    {line.strip()},\n"
    new_file += "  ];\n"

# Actually, the easier approach: I'll write the file directly with Python
# The existing detector.ts has the rules, I just need to make sure the
# language rules are available. Let me keep it simple.

print("New detector.ts built")
print("This approach needs refinement - let me write a complete file directly.")

# Write the file with a simple approach: just import languages at top and keep everything else
new_detector = detector
new_detector = new_detector.replace(
    "import type { DetectedIndicator, RiskLevel, ScanResult, ThreatMatch } from '@/types';",
    "import type { DetectedIndicator, RiskLevel, ScanResult, ThreatMatch } from '@/types';\nimport { SUPPORTED_LANGUAGES, LangCode, LanguageRule } from './languages';"
)

with open("src/lib/detector.ts", "w") as f:
    f.write(new_detector)

print("Wrote detector.ts with language import")
