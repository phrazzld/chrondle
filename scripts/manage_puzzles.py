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
        # The top-level structure is a dictionary, and the puzzles are under the "puzzles" key.
        data = json.load(f)
        return data.get("puzzles", {})


def write_puzzles(data):
    """Writes data to the puzzles.json file with pretty printing."""
    # The data passed in here is the full JSON structure, including metadata.
    puzzles = data.get("puzzles", {})
    
    # Sort puzzles by year (as integers) to ensure correct order
    try:
        sorted_years = sorted(puzzles.keys(), key=int)
    except ValueError as e:
        print(f"Error: Invalid year found in puzzle keys. Could not sort. Details: {e}", file=sys.stderr)
        sys.exit(1)
        
    sorted_puzzles = {year: puzzles[year] for year in sorted_years}

    # Create a new dictionary to hold the full file content
    file_content = read_full_json()
    file_content['puzzles'] = sorted_puzzles
    
    # Update metadata
    if 'meta' not in file_content:
        file_content['meta'] = {}
    file_content['meta']['total_puzzles'] = len(sorted_puzzles)
    if sorted_years:
        min_year = sorted_years[0]
        max_year = sorted_years[-1]
        file_content['meta']['date_range'] = f"{min_year}-{max_year}"
    else:
        file_content['meta']['date_range'] = ""


    with open(PUZZLES_FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(file_content, f, indent=2, ensure_ascii=False)
    print(f"Successfully updated {PUZZLES_FILE_PATH}")

def read_full_json():
    """Reads the entire JSON file, including metadata."""
    if not PUZZLES_FILE_PATH.is_file():
        return {"puzzles": {}, "meta": {}}
    with open(PUZZLES_FILE_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def add_puzzle(year, hints):
    """Adds a new puzzle to the file."""
    file_content = read_full_json()
    puzzles = file_content.get("puzzles", {})

    if str(year) in puzzles:
        print(f"Error: Year {year} already exists. Use 'update' to modify it.", file=sys.stderr)
        sys.exit(1)

    puzzles[str(year)] = hints
    file_content["puzzles"] = puzzles
    write_puzzles(file_content)
    print(f"Successfully added year {year}.")

def update_puzzle(year, hints):
    """Updates an existing puzzle in the file."""
    file_content = read_full_json()
    puzzles = file_content.get("puzzles", {})

    if str(year) not in puzzles:
        print(f"Error: Year {year} not found. Use 'add' to create it.", file=sys.stderr)
        sys.exit(1)

    puzzles[str(year)] = hints
    file_content["puzzles"] = puzzles
    write_puzzles(file_content)
    print(f"Successfully updated year {year}.")

def list_puzzles():
    """Lists all the years present in the puzzles file."""
    puzzles = read_puzzles()
    sorted_years = sorted(puzzles.keys(), key=int)
    print("The following years have hints defined in puzzles.json:")
    # Print in multiple columns for better readability
    col_width = 8
    cols = 10
    for i in range(0, len(sorted_years), cols):
        print("".join(f"{year: <{col_width}}" for year in sorted_years[i:i+cols]))


def show_puzzle(year):
    """Shows the hints for a specific year."""
    puzzles = read_puzzles()
    year_str = str(year)
    if year_str in puzzles:
        print(f"Hints for year {year}:")
        for i, hint in enumerate(puzzles[year_str], 1):
            print(f"  {i}. {hint}")
    else:
        print(f"Error: Year {year} not found.", file=sys.stderr)
        sys.exit(1)

def count_puzzles():
    """Counts the total number of puzzles."""
    puzzles = read_puzzles()
    print(f"There are {len(puzzles)} puzzles in the file.")


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

    # 'list' command
    subparsers.add_parser("list", help="List all years in the puzzle file.")

    # 'show' command
    parser_show = subparsers.add_parser("show", help="Show hints for a specific year.")
    parser_show.add_argument("year", type=int, help="The year to show.")

    # 'count' command
    subparsers.add_parser("count", help="Count the total number of puzzles.")


    args = parser.parse_args()

    if args.command == "add":
        add_puzzle(args.year, args.hints)
    elif args.command == "update":
        update_puzzle(args.year, args.hints)
    elif args.command == "list":
        list_puzzles()
    elif args.command == "show":
        show_puzzle(args.year)
    elif args.command == "count":
        count_puzzles()


if __name__ == "__main__":
    main()