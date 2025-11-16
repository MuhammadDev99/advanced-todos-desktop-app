import os
import argparse
from pathspec import PathSpec
from pathspec.patterns import GitWildMatchPattern

def get_gitignore_spec(root_path):
    """
    Finds and parses the .gitignore file in the root path.
    Returns a PathSpec object that can be used for matching.
    """
    gitignore_file = os.path.join(root_path, '.gitignore')
    patterns = []
    
    # Always add .git to the ignore list
    patterns.append(GitWildMatchPattern(".git/"))

    if os.path.isfile(gitignore_file):
        with open(gitignore_file, 'r') as f:
            lines = f.read().splitlines()
            for line in lines:
                # Ignore comments and empty lines
                if line.strip() and not line.strip().startswith('#'):
                    patterns.append(GitWildMatchPattern(line))
    
    return PathSpec(patterns)

def build_tree(current_path, root_path, spec, prefix="", max_level=None, level=0, print_files=True):
    """
    Recursively builds and prints the directory tree, respecting gitignore rules.
    
    Args:
        current_path: The directory path to scan in the current recursion level.
        root_path: The absolute path of the project's root (where .gitignore is).
        spec: The compiled PathSpec object from the .gitignore file.
        prefix: The string prefix for printing the tree structure.
        max_level: The maximum depth to traverse.
        level: The current depth of traversal.
        print_files: Boolean flag to include files in the output.
    """
    # Stop if max_level is defined and has been reached
    if max_level is not None and level >= max_level:
        return

    try:
        # Use os.scandir for better performance
        entries = sorted(os.scandir(current_path), key=lambda e: e.name.lower())
    except OSError as e:
        print(f"{prefix}└── [Error accessing: {os.path.basename(current_path)} - {e.strerror}]")
        return

    # Filter out ignored files and directories
    displayable_entries = []
    for entry in entries:
        # Get path relative to the root to match against .gitignore rules
        relative_path = os.path.relpath(entry.path, root_path)
        # On Windows, convert backslashes to forward slashes for matching
        relative_path = relative_path.replace("\\", "/")
        
        # To correctly match a directory, pathspec needs a trailing slash
        if entry.is_dir():
            relative_path += '/'
            
        if not spec.match_file(relative_path):
            displayable_entries.append(entry)

    # Separate directories and files for correct printing order
    if print_files:
        dir_entries = [e for e in displayable_entries if e.is_dir()]
        file_entries = [e for e in displayable_entries if e.is_file()]
        printable_entries = dir_entries + file_entries
    else:
        printable_entries = [e for e in displayable_entries if e.is_dir()]

    for i, entry in enumerate(printable_entries):
        is_last = (i == len(printable_entries) - 1)
        connector = "└── " if is_last else "├── "
        print(f"{prefix}{connector}{entry.name}")

        if entry.is_dir():
            new_prefix = prefix + ("    " if is_last else "│   ")
            build_tree(
                entry.path, 
                root_path, # CRITICAL: Pass the original root_path down
                spec, 
                prefix=new_prefix, 
                max_level=max_level, 
                level=level + 1,
                print_files=print_files
            )

def main():
    """
    Main function to parse arguments and start the tree generation.
    """
    parser = argparse.ArgumentParser(
        description="A 'tree' like command that respects .gitignore files.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        "path",
        nargs="?",
        default=".",
        help="The root directory to start the tree from. Defaults to the current directory."
    )
    parser.add_argument(
        "-L", "--level",
        type=int,
        help="Max display depth of the directory tree."
    )
    parser.add_argument(
        "-d", "--dirs-only",
        action="store_true",
        help="List directories only."
    )
    args = parser.parse_args()

    # The root_path is where the .gitignore is located and the base for matching
    root_path = os.path.abspath(args.path)

    if not os.path.isdir(root_path):
        print(f"Error: Directory not found at '{root_path}'")
        return

    # Load the .gitignore spec from the root of the project
    spec = get_gitignore_spec(root_path)

    print(os.path.basename(root_path))
    build_tree(
        current_path=root_path, 
        root_path=root_path,
        spec=spec, 
        max_level=args.level, 
        print_files=not args.dirs_only
    )

if __name__ == "__main__":
    main()