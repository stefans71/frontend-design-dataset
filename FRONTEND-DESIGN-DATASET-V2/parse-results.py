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

    # batch-test.sh saves working-tree files under src/ and artifacts under artifacts/
    # The implement node writes to model-decided paths (e.g. src/components/ui/Button.tsx,
    # src/App.tsx, index.html). Search src/ first (working-tree snapshot), then artifacts.
    html_file = None
    src_dir = component_dir / 'src'
    if src_dir.exists():
        html_files = sorted(src_dir.rglob('*.html'))
        if html_files:
            html_file = str(html_files[0])

    # Fallback: check artifacts dir
    if not html_file:
        artifacts_dir = component_dir / 'artifacts'
        if artifacts_dir.exists():
            html_files = sorted(artifacts_dir.rglob('*.html'))
            if html_files:
                html_file = str(html_files[0])

    # Fallback: check loose files in component dir root
    if not html_file:
        for candidate in ['output.html', 'index.html']:
            candidate_path = component_dir / candidate
            if candidate_path.exists():
                html_file = str(candidate_path)
                break

    # Count all source files for context
    all_src_files = sorted(src_dir.rglob('*')) if src_dir.exists() else []
    src_file_count = sum(1 for f in all_src_files if f.is_file())

    if html_file:
        outputs.append({
            'component_id': component_id,
            'model': model_name,
            'html_path': html_file,
            'src_file_count': src_file_count,
            'has_output': True
        })
        print(f"  {component_id}: {html_file} ({src_file_count} src files)")
    else:
        outputs.append({
            'component_id': component_id,
            'model': model_name,
            'html_path': None,
            'src_file_count': src_file_count,
            'has_output': False
        })
        print(f"  {component_id}: no HTML found ({src_file_count} src files)")

json.dump(outputs, open(output_file, 'w'), indent=2)
print(f"\nSaved {len(outputs)} entries to {output_file}")
print(f"With output: {sum(1 for o in outputs if o['has_output'])}/{len(outputs)}")
