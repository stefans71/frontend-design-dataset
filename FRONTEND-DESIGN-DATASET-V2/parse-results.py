#!/usr/bin/env python3
"""
Parse batch test results into a format compatible with score-validation.ts
Usage: python3 parse-results.py <results-dir> <model-name>
Output: JSON file with component_id -> html_path mappings
"""
import json, os, sys
from pathlib import Path

results_dir = Path(sys.argv[1])
model_name = sys.argv[2]  # "base" or "finetuned"
output_file = results_dir / f"{model_name}-outputs.json"

outputs = []
for component_dir in sorted(results_dir.iterdir()):
    if not component_dir.is_dir():
        continue

    component_id = component_dir.name

    # batch-test.sh saves output.html (copied from index.html) in each component dir
    html_file = None
    for candidate in ['output.html', 'index.html']:
        candidate_path = component_dir / candidate
        if candidate_path.exists():
            html_file = str(candidate_path)
            break

    char_count = 0
    if html_file:
        char_count = Path(html_file).stat().st_size
        outputs.append({
            'component_id': component_id,
            'model': model_name,
            'html_path': html_file,
            'char_count': char_count,
            'has_output': True
        })
        print(f"  {component_id}: {html_file} ({char_count} chars)")
    else:
        outputs.append({
            'component_id': component_id,
            'model': model_name,
            'html_path': None,
            'char_count': 0,
            'has_output': False
        })
        print(f"  {component_id}: no HTML found")

json.dump(outputs, open(output_file, 'w'), indent=2)
print(f"\nSaved {len(outputs)} entries to {output_file}")
print(f"With output: {sum(1 for o in outputs if o['has_output'])}/{len(outputs)}")
