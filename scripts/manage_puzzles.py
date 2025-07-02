
import argparse
import json
import sys
from pathlib import Path

# Define the absolute path to the puzzles.json file
# This assumes the script is run from the project root
PROJECT_ROOT = Path(__file__).parent.parent
PUZZLES_FILE_PATH = PROJECT_ROOT / "src" / "data" / "puzzles.json"

def read_puzzles():
    """Reads and parses the puzzles.json file."""
    if not PUZZLES_FILE_PATH.is_file():
        print(f"Error: Puzzles file not found at {PUZZLES_FILE_PATH}", file=sys.stderr)
        sys.exit(1)
    with open(PUZZLES_FILE_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_puzzles(data):
    """Writes data to the puzzles.json file with pretty printing."""
    puzzles = data.get("puzzles", {})
    
    # Sort puzzles by year (as integers) to ensure correct order
    try:
        sorted_years = sorted(puzzles.keys(), key=int)
    except ValueError as e:
        print(f"Error: Invalid year found in puzzle keys. Could not sort. Details: {e}", file=sys.stderr)
        sys.exit(1)
        
    sorted_puzzles = {year: puzzles[year] for year in sorted_years}

    # Update metadata
    data['puzzles'] = sorted_puzzles
    if 'meta' not in data:
        data['meta'] = {}
    data['meta']['total_puzzles'] = len(sorted_puzzles)
    if sorted_years:
        min_year = sorted_years[0]
        max_year = sorted_years[-1]
        data['meta']['date_range'] = f"{min_year}-{max_year}"
    else:
        data['meta']['date_range'] = ""


    with open(PUZZLES_FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Successfully updated {PUZZLES_FILE_PATH}")


def add_puzzle(year, hints):
    """Adds a new puzzle to the file."""
    data = read_puzzles()
    puzzles = data.get("puzzles", {})

    if str(year) in puzzles:
        print(f"Error: Year {year} already exists. Use 'update' to modify it.", file=sys.stderr)
        sys.exit(1)

    puzzles[str(year)] = hints
    data["puzzles"] = puzzles
    write_puzzles(data)
    print(f"Successfully added year {year}.")

def update_puzzle(year, hints):
    """Updates an existing puzzle in the file."""
    data = read_puzzles()
    puzzles = data.get("puzzles", {})

    if str(year) not in puzzles:
        print(f"Error: Year {year} not found. Use 'add' to create it.", file=sys.stderr)
        sys.exit(1)

    puzzles[str(year)] = hints
    data["puzzles"] = puzzles
    write_puzzles(data)
    print(f"Successfully updated year {year}.")


def main():
    """Main function to parse arguments and call the appropriate handler."""
    parser = argparse.ArgumentParser(
        description="A script to safely add or update entries in puzzles.json.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    subparsers = parser.add_subparsers(dest="command", required=True, help="Available commands")

    # 'add' command
    parser_add = subparsers.add_parser("add", help="Add a new year with its hints.")
    parser_add.add_argument("--year", type=int, required=True, help="The year to add (e.g., 1999 or -44).")
    parser_add.add_argument("--hints", nargs='+', required=True, help="A list of hints for the year, each enclosed in quotes.")

    # 'update' command
    parser_update = subparsers.add_parser("update", help="Update an existing year's hints.")
    parser_update.add_argument("--year", type=int, required=True, help="The year to update (e.g., 1999 or -44).")
    parser_update.add_argument("--hints", nargs='+', required=True, help="The new list of hints for the year, each enclosed in quotes.")

    args = parser.parse_args()

    if args.command == "add":
        add_puzzle(args.year, args.hints)
    elif args.command == "update":
        update_puzzle(args.year, args.hints)

if __name__ == "__main__":
    main()
