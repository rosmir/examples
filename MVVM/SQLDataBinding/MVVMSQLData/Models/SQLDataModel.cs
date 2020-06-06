// Copyright (c) Stepan Baranov (stephan@baranoff.dev). All rights reserved.
// Licensed under the BSD 3-Clause Clear License. See LICENSE file in the project root for full license information.

using System;
using System.Linq;

// MVVM: Models
// Model does not care about any MVVM layer above (Views, and View Models).
namespace MVVMSQLData.Models
{
    public class SQLDataModel : IDisposable
    {
        private readonly string[] TextArray = {
                                 "Nice day",
                                 "Wonderful day",
                                 "Joyful day",
                                 "Good day",
                                 "Splendid day",
                                 "Lovely day",
                                 "Great day",
                                 "Perfect day",
                                 "Excellent day",
                                 "Gorgeous day",
                                 "Beautiful day",
                                 "Fabulous day",
                                 "Awesome day",
                                 "Happy day",
                                 "Fun day",
                                 "Blessed day",
                                 "Peaceful day"
            };

        private bool disposedValue;

        private int CurIndex { get; set; } = 0;
        private int MaxIndex { get; set; } = 0;

        //Singleton pattern
        private static readonly SQLDataModel instance = new SQLDataModel();

        public static SQLDataModel Instance
        {
            get
            {
                return instance;
            }
        }

        private SQLDataModel()
        {

            using (var db = new SimpleDBContext())
            {
                // Ensure database is deleted to start with blank DB
                db.Database.EnsureDeleted();
            }

            using (var db = new SimpleDBContext())
            {
                //Ensure database is created
                db.Database.EnsureCreated();
                if (!db.TblDayText.Any())
                {
                    foreach (var s in TextArray)
                    {
                        db.TblDayText.Add(new DayText { DayTextStr = s });
                    }
                    db.SaveChanges();
                    CurIndex = db.TblDayText.OrderBy(r => r.Id).First<DayText>().Id;
                    // https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/ef/language-reference/supported-and-unsupported-linq-methods-linq-to-entities
                    MaxIndex = db.TblDayText.OrderBy(r => r.Id).Last<DayText>().Id;
                }
            }
        }

        // read next array element (with String type) by memorizing the positions
        public int NextString(out string stringValue, out int progressVal)
        {
            stringValue = string.Empty;
            progressVal = 0;
            int retVal = -1;

            if (CurIndex > MaxIndex)
                return retVal;

            using (var db = new SimpleDBContext())
            {
                // https://docs.microsoft.com/en-us/ef/ef6/querying/
                var s = db.TblDayText.Find(CurIndex);
                if (s != null)
                {
                    stringValue = s.DayTextStr;
                    progressVal = (int)(100 * CurIndex / MaxIndex);
                    CurIndex++;
                    retVal = 0;
                }
                else
                {
                    CurIndex = MaxIndex;
                }
            }

            return retVal;
        }

        public bool AddText(in string newText)
        {
            bool retVal = false;

            // check if string has sense
            if (String.IsNullOrEmpty(newText))
                return retVal;

            // protect from overload
            if (newText.Length > 64)
                return retVal;

            using (var db = new SimpleDBContext())
            {
                db.TblDayText.Add(new DayText { DayTextStr = newText });
                db.SaveChanges();
                // https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/ef/language-reference/supported-and-unsupported-linq-methods-linq-to-entities
                MaxIndex = db.TblDayText.OrderBy(r => r.Id).Last<DayText>().Id;
                retVal = true;
            }

            return retVal;
        }

        // reset the reading from SQLite DB
        public void Reset()
        {
            using (var db = new SimpleDBContext())
            {
                CurIndex = db.TblDayText.OrderBy(r => r.Id).First<DayText>().Id;
            }
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    // TODO: dispose managed state (managed objects)
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
