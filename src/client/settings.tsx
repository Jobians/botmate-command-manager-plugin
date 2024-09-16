import React, { useState, useEffect, useRef } from 'react';
import { toast, usePluginConfig } from '@botmate/client';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from '@botmate/ui';

function CommandManager() {
  const config = usePluginConfig();
  const [commands, setCommands] = useState<{ name: string; code: string }[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [commandToDelete, setCommandToDelete] = useState<string>('');

  const commandNameRef = useRef<HTMLInputElement>(null);
  const commandCodeRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadCommands() {
      const savedCommands = await config.get('commands', []);
      setCommands(savedCommands);
    }
    loadCommands();
  }, []);

  useEffect(() => {
    if (selectedCommand && isEditing) {
      const command = commands.find(c => c.name === selectedCommand);
      if (command) {
        commandNameRef.current!.value = command.name;
        commandCodeRef.current!.value = command.code;
      }
    }
  }, [selectedCommand, isEditing]);

  const handleSaveCommand = async () => {
    const commandName = commandNameRef.current?.value;
    const commandCode = commandCodeRef.current?.value;

    if (commandName && commandCode) {
      if (!isEditing && commands.some((cmd) => cmd.name === commandName)) {
        toast.error('Command name already exists. Please choose a different name.');
        return;
      }

      let updatedCommands = [...commands];

      if (isEditing) {
        updatedCommands = commands.map((cmd) =>
          cmd.name === selectedCommand ? { name: commandName, code: commandCode } : cmd
        );
      } else {
        updatedCommands.push({ name: commandName, code: commandCode });
      }

      await config.save('commands', updatedCommands);
      setCommands(updatedCommands);

      toast.success('Command saved successfully');
      clearForm();
    } else {
      toast.error('Please fill in all fields');
    }
  };

  const handleEditCommand = (commandName: string) => {
    setSelectedCommand(commandName);
    setIsEditing(true);
  };

  const handleDeleteCommand = (commandName: string) => {
    setCommandToDelete(commandName);
    setIsDialogOpen(true);
  };

  const confirmDeleteCommand = async () => {
    const updatedCommands = commands.filter(cmd => cmd.name !== commandToDelete);
    await config.save('commands', updatedCommands);
    setCommands(updatedCommands);
    setIsDialogOpen(false);
    toast.success('Command deleted');
  };

  const clearForm = () => {
    commandNameRef.current!.value = '';
    commandCodeRef.current!.value = '';
    setIsEditing(false);
    setSelectedCommand('');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-md">{isEditing ? 'Edit Command' : 'Create Command'}</CardTitle>
          <CardDescription className="text-sm">
            {isEditing ? 'Edit the selected command.' : 'Create a new command and define its behavior.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <div className="space-y-1">
            <label htmlFor="commandName">Command Name</label>
            <Input id="commandName" type="text" placeholder="/start" ref={commandNameRef} />
          </div>
          <div className="space-y-1">
            <label htmlFor="commandCode">Command Code</label>
            <textarea
              id="commandCode"
              placeholder='bot.reply("Hello, world!");'
              ref={commandCodeRef}
              rows={6}
              className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveCommand}>
            {isEditing ? 'Save Changes' : 'Create Command'}
          </Button>
          {isEditing && (
            <Button variant="secondary" onClick={clearForm} className="ml-2">
              Cancel
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Command List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Manage Commands</CardTitle>
          <CardDescription className="text-sm">Edit or delete existing commands.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {commands.length > 0 ? (
            commands.map((command) => (
              <div key={command.name} className="flex justify-between items-center">
                <div>{command.name}</div>
                <div className="flex space-x-2">
                  <Button variant="secondary" onClick={() => handleEditCommand(command.name)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteCommand(command.name)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div>No commands available</div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the command "{commandToDelete}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCommand}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CommandManager;