// Meeting.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Switch
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Calendar from 'expo-calendar';
import * as MailComposer from 'expo-mail-composer';
import { useAuth } from '../Auth/AuthContext';
import socket from '../socket'; // Shared socket instance

const Meeting = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 60 * 60 * 1000));
  const [attendees, setAttendees] = useState('');
  const [isVirtual, setIsVirtual] = useState(true);
  const [meetingLink, setMeetingLink] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState('weekly');

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Calendar permission is needed to create meetings.');
      }
    })();
  }, []);

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      if (selectedDate >= endDate) {
        const newEndDate = new Date(selectedDate.getTime() + 60 * 60 * 1000);
        setEndDate(newEndDate);
      }
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      if (selectedDate <= startDate) {
        Alert.alert('Invalid Time', 'End time must be after start time.');
        return;
      }
      setEndDate(selectedDate);
    }
  };

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const generateICalString = () => {
    const now = new Date();
    const startDateISO = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDateISO = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const createdISO = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const organizerEmail = user.email || 'admin@example.com';

    let attendeesList = '';
    if (attendees.trim()) {
      attendeesList = attendees
        .split(',')
        .map(email => `ATTENDEE;CN=${email.trim()};RSVP=TRUE:mailto:${email.trim()}`)
        .join('\r\n');
    }

    let recurRule = '';
    if (isRecurring) {
      if (recurringType === 'daily') recurRule = 'RRULE:FREQ=DAILY;COUNT=10';
      else if (recurringType === 'weekly') recurRule = 'RRULE:FREQ=WEEKLY;COUNT=8';
      else if (recurringType === 'monthly') recurRule = 'RRULE:FREQ=MONTHLY;COUNT=3';
    }

    const locationField = isVirtual
      ? `LOCATION:Virtual Meeting\r\nDESCRIPTION:${description}\\n\\nJoin: ${meetingLink}`
      : `LOCATION:${location}\r\nDESCRIPTION:${description}`;

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Admin Meeting Creator//EN',
      `DTSTART:${startDateISO}`,
      `DTEND:${endDateISO}`,
      `DTSTAMP:${createdISO}`,
      `ORGANIZER;CN=${user.name}:mailto:${organizerEmail}`,
      attendeesList,
      `UID:${Math.random().toString(36).substring(2)}@meeting.com`,
      'CLASS:PUBLIC',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      recurRule,
      `SUMMARY:${title}`,
      locationField,
      'TRANSP:OPAQUE',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  };

  // Generate a Google Calendar add event URL
  const generateGoogleCalendarUrl = (meetingInfo) => {
    const formatForGoogle = (dateStr) => {
      const d = new Date(dateStr);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    const startGoogle = formatForGoogle(meetingInfo.startDate);
    const endGoogle = formatForGoogle(meetingInfo.endDate);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: meetingInfo.title,
      dates: `${startGoogle}/${endGoogle}`,
      details: meetingInfo.description,
      location: meetingInfo.location,
      sf: 'true',
      output: 'xml'
    });
    return `https://www.google.com/calendar/render?${params.toString()}`;
  };

  const sendEmailInvites = async (meetingInfo) => {
    try {
      const googleCalendarUrl = generateGoogleCalendarUrl(meetingInfo);
      const emailBody = `Hello,

You are invited to a meeting.

Title: ${meetingInfo.title}
Description: ${meetingInfo.description}
Start: ${new Date(meetingInfo.startDate).toLocaleString()}
End: ${new Date(meetingInfo.endDate).toLocaleString()}
Location: ${meetingInfo.location}

Meeting Details:
${meetingInfo.icalString}

To add this event to your Google Calendar, click the link below:
${googleCalendarUrl}

Please add this event to your calendar.`;

      const options = {
        recipients: meetingInfo.attendees, // Array of email addresses
        subject: `Meeting Invite: ${meetingInfo.title}`,
        body: emailBody,
        isHtml: false,
      };
      const result = await MailComposer.composeAsync(options);
      console.log("Email composer result:", result);
    } catch (error) {
      console.error("Error sending email invites:", error);
    }
  };

  const createMeeting = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Meeting title is required');
      return;
    }

    try {
      const calendarId = await getDefaultCalendarId();
      const eventDetails = {
        title,
        startDate,
        endDate,
        notes: description,
        location: isVirtual ? 'Virtual Meeting' : location,
        timeZone: 'UTC',
      };

      if (calendarId) {
        const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
        console.log('Created event with ID:', eventId);
      }

      const icalString = generateICalString();
      const meetingInfo = {
        id: `meeting-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'meeting',
        title,
        description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: isVirtual ? 'Virtual Meeting' : location,
        meetingLink: isVirtual ? meetingLink : null,
        isRecurring,
        recurringType: isRecurring ? recurringType : null,
        organizer: user.name,
        attendees: attendees.split(',').map(email => email.trim()),
        icalString,
        userName: user.name,
        timestamp: new Date().toISOString(),
        text: `${user.name} created a meeting: ${title}`,
      };

      console.log("Emitting meeting:", meetingInfo);
      socket.emit('sendMessage', meetingInfo);
      
      // After emitting, open the mail composer to send invites (with Google Calendar link)
      sendEmailInvites(meetingInfo);

      Alert.alert('Success', 'Meeting created, shared to chat, and email invites sent!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating meeting:', error);
      Alert.alert('Error', 'Failed to create meeting: ' + error.message);
    }
  };

  const getDefaultCalendarId = async () => {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendars = calendars.filter(cal =>
      cal.source.name === (Platform.OS === 'ios' ? 'iCloud' : 'Google') &&
      cal.allowsModifications
    );
    return defaultCalendars.length > 0 ? defaultCalendars[0].id : calendars.length > 0 ? calendars[0].id : null;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#6200ee" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Meeting</Text>
          <TouchableOpacity onPress={createMeeting} style={styles.createButton}>
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Meeting Title*</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter meeting title"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter meeting description"
            multiline
            numberOfLines={4}
          />

          <View style={styles.dateTimeSection}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            <View style={styles.dateTimePicker}>
              <Text style={styles.dateTimeLabel}>Start:</Text>
              <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowStartPicker(true)}>
                <Text>{formatDate(startDate)} {formatTime(startDate)}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateTimePicker}>
              <Text style={styles.dateTimeLabel}>End:</Text>
              <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowEndPicker(true)}>
                <Text>{formatDate(endDate)} {formatTime(endDate)}</Text>
              </TouchableOpacity>
            </View>
            {showStartPicker && (
              <DateTimePicker value={startDate} mode="datetime" display="default" onChange={handleStartDateChange} />
            )}
            {showEndPicker && (
              <DateTimePicker value={endDate} mode="datetime" display="default" onChange={handleEndDateChange} minimumDate={startDate} />
            )}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Recurring Meeting</Text>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: "#767577", true: "#b39ddb" }}
              thumbColor={isRecurring ? "#6200ee" : "#f4f3f4"}
            />
          </View>

          {isRecurring && (
            <View style={styles.recurringOptions}>
              <TouchableOpacity style={[styles.recurringButton, recurringType === 'daily' && styles.recurringButtonActive]} onPress={() => setRecurringType('daily')}>
                <Text style={recurringType === 'daily' ? styles.recurringTextActive : styles.recurringText}>Daily</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.recurringButton, recurringType === 'weekly' && styles.recurringButtonActive]} onPress={() => setRecurringType('weekly')}>
                <Text style={recurringType === 'weekly' ? styles.recurringTextActive : styles.recurringText}>Weekly</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.recurringButton, recurringType === 'monthly' && styles.recurringButtonActive]} onPress={() => setRecurringType('monthly')}>
                <Text style={recurringType === 'monthly' ? styles.recurringTextActive : styles.recurringText}>Monthly</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.switchRow}>
            <Text style={styles.label}>Virtual Meeting</Text>
            <Switch
              value={isVirtual}
              onValueChange={setIsVirtual}
              trackColor={{ false: "#767577", true: "#b39ddb" }}
              thumbColor={isVirtual ? "#6200ee" : "#f4f3f4"}
            />
          </View>

          {isVirtual ? (
            <View>
              <Text style={styles.label}>Meeting Link</Text>
              <TextInput
                style={styles.input}
                value={meetingLink}
                onChangeText={setMeetingLink}
                placeholder="Enter virtual meeting link"
                autoCapitalize="none"
              />
            </View>
          ) : (
            <View>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter meeting location"
              />
            </View>
          )}

          <Text style={styles.label}>Attendees (comma separated)</Text>
          <TextInput
            style={styles.input}
            value={attendees}
            onChangeText={setAttendees}
            placeholder="email1@example.com, email2@example.com"
            autoCapitalize="none"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: 'white' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  createButton: { backgroundColor: '#6200ee', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 },
  createButtonText: { color: 'white', fontWeight: 'bold' },
  formContainer: { padding: 16 },
  label: { fontSize: 16, fontWeight: '500', marginTop: 16, marginBottom: 4 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  dateTimeSection: { marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  dateTimePicker: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dateTimeLabel: { fontSize: 16, width: 60 },
  dateTimeButton: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, flex: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  recurringOptions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  recurringButton: { backgroundColor: '#e0e0e0', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  recurringButtonActive: { backgroundColor: '#6200ee' },
  recurringText: { color: '#000', fontSize: 14 },
  recurringTextActive: { color: '#fff', fontSize: 14 },
});

export default Meeting;
