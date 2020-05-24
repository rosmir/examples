using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Input;
using CommBindWPF.Models;

//MVVM: View Models
namespace CommBindWPF.ViewModels
{
    public class Publisher : System.ComponentModel.INotifyPropertyChanged, System.IDisposable
    {
        private bool disposedValue;

        // The data binding mechanism in WPF attaches a handler to this PropertyChanged event
        // so it can be notified when the property changes and keep the target updated with 
        // the new value.
        public event System.ComponentModel.PropertyChangedEventHandler PropertyChanged;

        // fires PropertyChanged event to notify the subscriber (WPF control)
        // see https://docs.microsoft.com/en-us/dotnet/framework/wpf/data/how-to-implement-property-change-notification
        protected void NotifyPropertyChangedEvent([CallerMemberName] string name = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        }

        // Data Model
        private JSONModel jsonModel;

        public Publisher()
        {
            // we prepare an instance of Data Model to provide some data
            jsonModel = new JSONModel();
        }

        // internal default values regardless Data Model
        private string _someText = "Let's start!";
        private string _butText = "Click me!";
        private int _progressVal = 0;

        // WPF User control will bind to this Property (Data Binding)
        public string SomeText
        {
            get
            {
                return _someText;
            }
            set
            {
                _someText = value;
                // we should announce that the Property was changed. Then, subscribed WPF control will update its value.
                NotifyPropertyChangedEvent();
            }
        }

        // WPF User control will bind to this Property (Data Binding)
        public string ButText
        {
            get
            {
                return _butText;
            }
            set
            {
                _butText = value;
                // we should announce that the Property was changed. Then, subscribed WPF control will update its value.
                NotifyPropertyChangedEvent();
            }
        }

        // WPF User control will bind to this Property (Data Binding)
        public int ProgressVal
        {
            get
            {
                return _progressVal;
            }
            set
            {
                _progressVal = value;
                // we should announce that the Property was changed. Then, subscribed WPF control will update its value.
                NotifyPropertyChangedEvent();
            }
        }

        // WPF User control will bind to this Property (Command Binding).
        // As the result the listening object (ICommand interface) will be created.
        // Then this object will be subscribed to the click events of WPF User control.
        // Every time the WPF control fires events, this object will run Execute() method.
        // In return the WPF control will be subscribed to the CanExecuteChanged events
        // of this Command object to enable or disable itself (by invoking CanExecute() call).
        public ICommand ReactOnButtonClick
        {
            get
            {
                return new DelegateCommand(UpdateSomeText);
            }
        }

        /// <summary>
        /// Command to terminate the App
        /// </summary>
        public ICommand ReactOnExitButton
        {
            get
            {
                return new DelegateCommand(AppExitCommand);
            }
        }

        /// <summary>
        /// Command to reset App state
        /// </summary>
        public ICommand ReactOnResetButton
        {
            get
            {
                return new DelegateCommand(AppResetCommand);
            }
        }

        // Action for the Command object. We use Model for data retrieval.
        // ICommand.Execute() will call this through Action delegate
        private void UpdateSomeText()
        {
            int retVal = jsonModel.NextString(out string _str, out int _val);
            if (retVal < 0)
            {
                SomeText = "No string values any more... You can stop this app!";
                ButText = "...";
                ProgressVal = 100;
            }
            else
            {
                SomeText = _str;
                ProgressVal = _val;
            }
        }

        /// <summary>
        /// Action to terminate the App
        /// </summary>
        private void AppExitCommand()
        {
            Application.Current.MainWindow.Close();
        }

        /// <summary>
        /// Action to reset App's State
        /// </summary>
        private void AppResetCommand()
        {
            jsonModel.Dispose();
            jsonModel = new JSONModel();
            SomeText = "Start over!";
            ButText = "Push me!";
            ProgressVal = 0;
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    // TODO: dispose managed state (managed objects)
                    jsonModel.Dispose();
                }

                // TODO: free unmanaged resources (unmanaged objects) and override finalizer
                // TODO: set large fields to null
                disposedValue = true;
            }
        }

        public void Dispose()
        {
            // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }
    }
}
