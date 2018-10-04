# Git command 

# git config
This command sets the author name and email address respectively to be used with your commits.
Usage: git config –global user.name “[name]”  

Usage: git config –global user.email “[email address]”  

#git init

This command is used to start a new repository.
Usage: git init [repository name]

#git init

This command is used to start a new repository.
Usage: git init [repository name]

#git clone

This command is used to obtain a repository from an existing URL.
Usage: git clone [url]  

#git add

This command adds a file to the staging area.
Usage: git add [file]  
Usage: git add *  

#git commit

This command records or snapshots the file permanently in the version history.
Usage: git commit -m “[ Type in the commit message]”  

#git diff

This command shows the file differences which are not yet staged.
Usage: git diff

#git diff –staged 

This command shows the differences between the files in the staging area and the latest version present.
Usage: git diff –staged

#git diff [first branch] [second branch] 

This command shows the differences between the two branches mentioned.
git diff [first branch] [second branch]

#git reset 

This command unstages the file, but it preserves the file contents.
Usage: git reset [file]  

# git reset [commit] 

This command undoes all the commits after the specified commit and preserves the changes locally.

#git reset –hard [commit]

This command discards all history and goes back to the specified commit.

#git status

This command lists all the files that have to be committed.
Usage: git status

#git rm 

This command deletes the file from your working directory and stages the deletion.
Usage: git rm [file] 

#git log

This command is used to list the version history for the current branch.
Usage: git log  

#git log –follow[file]  

This command lists version history for a file, including the renaming of files also.

#git show

This command shows the metadata and content changes of the specified commit.
Usage: git show [commit] 

#git tag

This command is used to give tags to the specified commit.
Usage: git tag [commitID]  

#git branch

This command lists all the local branches in the current repository.
Usage: git branch 

#git checkout -b [branch name]  

This command creates a new branch and also switches to it.

#git merge

This command merges the specified branch’s history into the current branch.
Usage: git merge [branch name]  

#git remote

This command is used to connect your local repository to the remote server.
Usage: git remote add [variable name] [Remote Server Link]  

#git push

This command sends the committed changes of master branch to your remote repository.
Usage: git push [variable name] master 

#git push [variable name] [branch]  

This command sends the branch commits to your remote repository.

#git push –all [variable name]  

This command pushes all branches to your remote repository.

#git push [variable name] :[branch name]

This command deletes a branch on your remote repository.

#git pull

This command fetches and merges changes on the remote server to your working directory.
git pull [Repository Link]

#git stash

This command temporarily stores all the modified tracked files.
Usage: git stash save  

#git stash pop

This command restores the most recently stashed files.

#git stash list

This command lists all stashed changesets.

#git stash drop  

This command discards the most recently stashed changeset.