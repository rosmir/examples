// Copyright (c) Stepan Baranov (stephan@baranoff.dev). All rights reserved.
// Licensed under the BSD 3-Clause Clear License. See LICENSE file in the project root for full license information.

using System;
using System.Text;
using System.Text.Json;

// MVVM: Models
// Model does not care about any MVVM layer above (Views, and View Models).
namespace CommBindWPF.Models
{
    public class JSONModel : IDisposable
    {
        private bool disposedValue;

        // some predefined values in JSON string array
        private readonly string jsonString = @"{
                ""TextArray"": [ ""Nice day"",
                                 ""Wonderful day"",
                                 ""Joyful day"",
                                 ""Good day"",
                                 ""Splendid day"",
                                 ""Lovely day"",
                                 ""Great day"",
                                 ""Perfect day"",
                                 ""Excellent day"",
                                 ""Gorgeous day"",
                                 ""Beautiful day"",
                                 ""Fabulous day"",
                                 ""Awesome day"",
                                 ""Happy day"",
                                 ""Fun day"",
                                 ""Blessed day"",
                                 ""Peaceful day"" ]
            }";

        private System.Buffers.ReadOnlySequence<byte> JsonBuffer { get; set; }
        private System.Text.Json.JsonReaderState CurPosition { get; set; } = default;
        private SequencePosition BuffPosition { get; set; } = default;
        private bool EndOfJSON { get; set; } = false;
        private int MaxBuffSize { get; set; } = 0;

        public JSONModel()
        {
            JsonBuffer = new System.Buffers.ReadOnlySequence<byte>(Encoding.UTF8.GetBytes(jsonString));
            MaxBuffSize = (int)JsonBuffer.Length;

            // Search for "TextArray" property name
            var reader = new Utf8JsonReader(JsonBuffer, isFinalBlock: false, CurPosition);
#pragma warning disable CA1303 // Do not pass literals as localized parameters
            while (reader.TokenType != JsonTokenType.PropertyName || !reader.ValueTextEquals("TextArray"))
#pragma warning restore CA1303 // Do not pass literals as localized parameters
            {
                reader.Read();
            }
            // Search for start of String Array
            while (reader.TokenType != JsonTokenType.StartArray)
            {
                reader.Read();
            }

            BuffPosition = JsonBuffer.GetPosition(reader.BytesConsumed);
            CurPosition = reader.CurrentState;
        }

        // read next array element (with String type) by memorizing the positions
        public int NextString(out string stringValue, out int progressVal)
        {
            stringValue = string.Empty;
            progressVal = 0;
            int retVal = -1;

            if (EndOfJSON)
                return retVal;

            var reader = new Utf8JsonReader(JsonBuffer.Slice(BuffPosition), isFinalBlock: false, CurPosition);

            while (reader.TokenType != JsonTokenType.EndArray)
            {
                reader.Read();
                if (reader.TokenType == JsonTokenType.String)
                {
                    stringValue = reader.GetString();
                }
                else if (reader.TokenType == JsonTokenType.EndArray)
                {
                    EndOfJSON = true;
                    break;
                }
                else
                    continue;

                retVal = 0;
                BuffPosition = JsonBuffer.GetPosition(reader.BytesConsumed, BuffPosition);
                CurPosition = reader.CurrentState;
                progressVal = (int)(100 * BuffPosition.GetInteger() / MaxBuffSize);

                break;
            }

            return retVal;
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

        // // TODO: override finalizer only if 'Dispose(bool disposing)' has code to free unmanaged resources
        // ~JSONModel()
        // {
        //     // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
        //     Dispose(disposing: false);
        // }

        public void Dispose()
        {
            // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }
    }
}
