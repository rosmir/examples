//MVVM: View Models
namespace MVVMSQLData.ViewModels
{
    // we need this class for Command Binding to support ICommand Interface
    public class DelegateCommand : System.Windows.Input.ICommand
    {
        private readonly System.Action _action;

        public DelegateCommand(System.Action action)
        {
            _action = action;
        }

        public void Execute(object parameter)
        {
            _action();
        }

        public bool CanExecute(object parameter)
        {
            return true;
        }

        public event System.EventHandler CanExecuteChanged
        {
            add { }
            remove { }
        }
    }
}
