// Copyright (c) Stepan Baranov (stephan@baranoff.dev). All rights reserved.
// Licensed under the BSD 3-Clause Clear License. See LICENSE file in the project root for full license information.

using System;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Input;
using MVVMSQLData.Models;
using MVVMSQLData.Views;

//MVVM: View Models
namespace MVVMSQLData.ViewModels
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
        private readonly SQLDataModel sqlDataModel;

        public Publisher()
        {
            // we prepare an instance of Data Model to provide some data
            sqlDataModel = SQLDataModel.Instance;
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
        public string InputText
        {
            get;
            set;
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
        /// Command's action to terminate the App
        /// </summary>
        private void AppExitCommand()
        {
            Application.Current.MainWindow.Close();
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

        // Action for the Command object. We use Model for data retrieval.
        // ICommand.Execute() will call this through Action delegate
        private void UpdateSomeText()
        {
            int retVal = sqlDataModel.NextString(out string _str, out int _val);
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
        /// Command to reset App state
        /// </summary>
        public ICommand ReactOnResetButton
        {
            get
            {
                return new DelegateCommand(AppResetCommand);
            }
        }

        /// <summary>
        /// Action to reset App's State
        /// </summary>
        private void AppResetCommand()
        {
            sqlDataModel.Reset();
            SomeText = "Start over!";
            ButText = "Push me!";
            ProgressVal = 0;
        }

        /// <summary>
        /// Command to open new dialog to add text to SQLite DB
        /// </summary>
        public ICommand ReactOnAddButton
        {
            get
            {
                return new DelegateCommand(ShowAddTextDialog);
            }
        }

        /// <summary>
        /// Command's action to display new dialog to add text
        /// </summary>
        private void ShowAddTextDialog()
        {
            Views.DialogWindow _dialogWindow = new Views.DialogWindow();
            _dialogWindow.ShowDialog();
        }

        /// <summary>
        /// Command to accept new text for SQLite DB
        /// </summary>
        public ICommand ReactOnOKButton
        {
            get
            {
                return new DelegateCommand(AddTextCommand);
            }
        }

        /// <summary>
        /// Command's action to accept new text for SQLite DB
        /// </summary>
        private void AddTextCommand()
        {
            if (!string.IsNullOrEmpty(this.InputText))
            {
                sqlDataModel.AddText(this.InputText);
            }
            else
                return;

            // let's close Dialog window to return to Main UI window
            Application.Current.Windows.OfType<DialogWindow>().First().Close();
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    // TODO: dispose managed state (managed objects)
                    sqlDataModel.Dispose();
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
