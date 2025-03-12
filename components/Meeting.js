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
  Switch,
  Image
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

  const renderRecurringButton = (type, label, icon) => (
    <TouchableOpacity 
      style={[
        styles.recurringButton, 
        recurringType === type && styles.recurringButtonActive
      ]} 
      onPress={() => setRecurringType(type)}
    >
      <Icon 
        name={icon} 
        size={16} 
        color={recurringType === type ? "#ffffff" : "#555555"} 
        style={styles.recurringIcon} 
      />
      <Text style={recurringType === type ? styles.recurringTextActive : styles.recurringText}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Meeting</Text>
        <TouchableOpacity onPress={createMeeting} style={styles.createButton}>
          <Text style={styles.createButtonText}>Create</Text>
          <Icon name="checkmark-circle" size={18} color="white" style={styles.createIcon} />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              <View style={styles.iconLabelContainer}>
                <Icon name="briefcase-outline" size={20} color="#5C00EA" />
                <Text style={styles.label}>Meeting Title*</Text>
              </View>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter meeting title"
                placeholderTextColor="#A0A0A0"
              />

              <View style={styles.iconLabelContainer}>
                <Icon name="document-text-outline" size={20} color="#5C00EA" />
                <Text style={styles.label}>Description</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter meeting description"
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={4}
              />

              <View style={styles.cardDivider} />

              <View style={styles.iconLabelContainer}>
                <Icon name="calendar-outline" size={20} color="#5C00EA" />
                <Text style={styles.sectionTitle}>Date & Time</Text>
              </View>

              <View style={styles.dateTimeContainer}>
                <View style={styles.dateTimePicker}>
                  <Text style={styles.dateTimeLabel}>Start:</Text>
                  <TouchableOpacity 
                    style={styles.dateTimeButton} 
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Icon name="time-outline" size={18} color="#5C00EA" style={styles.dateTimeIcon} />
                    <Text style={styles.dateTimeButtonText}>
                      {formatDate(startDate)} {formatTime(startDate)}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.dateTimePicker}>
                  <Text style={styles.dateTimeLabel}>End:</Text>
                  <TouchableOpacity 
                    style={styles.dateTimeButton} 
                    onPress={() => setShowEndPicker(true)}
                  >
                    <Icon name="time-outline" size={18} color="#5C00EA" style={styles.dateTimeIcon} />
                    <Text style={styles.dateTimeButtonText}>
                      {formatDate(endDate)} {formatTime(endDate)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {showStartPicker && (
                <DateTimePicker 
                  value={startDate} 
                  mode="datetime" 
                  display="default" 
                  onChange={handleStartDateChange} 
                />
              )}
              {showEndPicker && (
                <DateTimePicker 
                  value={endDate} 
                  mode="datetime" 
                  display="default" 
                  onChange={handleEndDateChange} 
                  minimumDate={startDate} 
                />
              )}

              <View style={styles.cardDivider} />

              <View style={styles.switchRow}>
                <View style={styles.switchLabelContainer}>
                  <Icon name="repeat-outline" size={20} color="#5C00EA" />
                  <Text style={styles.switchLabel}>Recurring Meeting</Text>
                </View>
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  trackColor={{ false: "#E0E0E0", true: "#D1C4E9" }}
                  thumbColor={isRecurring ? "#5C00EA" : "#f4f3f4"}
                  ios_backgroundColor="#E0E0E0"
                />
              </View>

              {isRecurring && (
                <View style={styles.recurringOptions}>
                  {renderRecurringButton('daily', 'Daily', 'today-outline')}
                  {renderRecurringButton('weekly', 'Weekly', 'calendar-outline')}
                  {renderRecurringButton('monthly', 'Monthly', 'calendar-clear-outline')}
                </View>
              )}

              <View style={styles.cardDivider} />

              <View style={styles.switchRow}>
                <View style={styles.switchLabelContainer}>
                  <Icon name="videocam-outline" size={20} color="#5C00EA" />
                  <Text style={styles.switchLabel}>Virtual Meeting</Text>
                </View>
                <Switch
                  value={isVirtual}
                  onValueChange={setIsVirtual}
                  trackColor={{ false: "#E0E0E0", true: "#D1C4E9" }}
                  thumbColor={isVirtual ? "#5C00EA" : "#f4f3f4"}
                  ios_backgroundColor="#E0E0E0"
                />
              </View>

              {isVirtual ? (
                <View>
                  <View style={styles.iconLabelContainer}>
                    <Icon name="link-outline" size={20} color="#5C00EA" />
                    <Text style={styles.label}>Meeting Link</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={meetingLink}
                    onChangeText={setMeetingLink}
                    placeholder="Enter virtual meeting link"
                    placeholderTextColor="#A0A0A0"
                    autoCapitalize="none"
                  />
                </View>
              ) : (
                <View>
                  <View style={styles.iconLabelContainer}>
                    <Icon name="location-outline" size={20} color="#5C00EA" />
                    <Text style={styles.label}>Location</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Enter meeting location"
                    placeholderTextColor="#A0A0A0"
                  />
                </View>
              )}

              <View style={styles.cardDivider} />

              <View style={styles.iconLabelContainer}>
                <Icon name="people-outline" size={20} color="#5C00EA" />
                <Text style={styles.label}>Attendees (comma separated)</Text>
              </View>
              <TextInput
                style={styles.input}
                value={attendees}
                onChangeText={setAttendees}
                placeholder="email1@example.com, email2@example.com"
                placeholderTextColor="#A0A0A0"
                autoCapitalize="none"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F7FA' 
  },
  keyboardView: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 16, 
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, 
    borderBottomColor: '#EEEEEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: { 
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#333333'
  },
  createButton: { 
    backgroundColor: '#5C00EA', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#5C00EA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  createButtonText: { 
    color: 'white', 
    fontWeight: 'bold',
    marginRight: 4
  },
  createIcon: {
    marginLeft: 4
  },
  formContainer: { 
    padding: 16 
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4
  },
  label: { 
    fontSize: 16, 
    fontWeight: '500', 
    marginLeft: 8,
    color: '#333333'
  },
  input: { 
    backgroundColor: '#F9F9F9', 
    borderWidth: 1, 
    borderColor: '#EEEEEE', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 12, 
    fontSize: 16,
    color: '#333333'
  },
  textArea: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginLeft: 8,
    color: '#333333'
  },
  dateTimeContainer: {
    marginTop: 8
  },
  dateTimePicker: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  dateTimeLabel: { 
    fontSize: 16, 
    width: 60,
    color: '#555555'
  },
  dateTimeButton: { 
    backgroundColor: '#F9F9F9', 
    borderWidth: 1, 
    borderColor: '#EEEEEE', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 12, 
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateTimeIcon: {
    marginRight: 8
  },
  dateTimeButtonText: {
    color: '#333333',
    fontSize: 15
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16
  },
  switchRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    color: '#333333'
  },
  recurringOptions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 12,
    marginBottom: 4
  },
  recurringButton: { 
    backgroundColor: '#F5F5F5', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5'
  },
  recurringButtonActive: { 
    backgroundColor: '#5C00EA',
    borderColor: '#5C00EA' 
  },
  recurringIcon: {
    marginRight: 6
  },
  recurringText: { 
    color: '#555555', 
    fontSize: 14,
    fontWeight: '500'
  },
  recurringTextActive: { 
    color: '#fff', 
    fontSize: 14,
    fontWeight: '500'
  }
});

export default Meeting;