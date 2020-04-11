import java.io.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import javax.swing.*;
import java.time.format.DateTimeFormatter;  
import java.time.LocalDateTime;    

// creazione di una classe swing
public class Bonelli extends JFrame{
    static 	DefaultListModel<String> _AB_elencoVoci = new DefaultListModel<String> ();
    static	DefaultListModel<String> _AB_elencoVociSelezionate = new DefaultListModel<String> ();
    
	static JList<String> _AB_lista =  new JList<String>();
	static JList<String> _AB_listaSelezionati = new JList<String>();
    
    static JTextField _AB_TxtUno = new JTextField("");
    static JTextField _AB_TxtDue = new JTextField("");
    static JTextField _AB_TxtTre = new JTextField("");
    static String[] vet = { "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre" };
    static JComboBox<String> _AB_TxtQuattro = new JComboBox<String>(vet);
    
    static JButton _AB_BtnUno = new JButton("CARICA");
    static JButton _AB_BtnDue = new JButton("RIMUOVI");
    static JButton _AB_BtnTre = new JButton("INTERVENTO");
    static JButton _AB_BtnQuattro = new JButton("ESEGUITO");
    
    
    public static void main(final String[] s){
		SwingUtilities.invokeLater(new Runnable(){
		@Override
		public void run() {
		_AB_avvio();
		}
	});
}

static void _AB_avvio(){
    
    // CREAZIONE DEI CONTENITORI DELLE LISTE
    
	// COSTRUZIONE FINESTRA DI PARTENZA
	Bonelli _AB_classePrincipale = new Bonelli();
	_AB_classePrincipale.setDefaultCloseOperation(EXIT_ON_CLOSE);
	_AB_classePrincipale.setSize(400, 400);
    _AB_classePrincipale.setLayout(new GridLayout(3, 0));
	_AB_classePrincipale.setVisible(true);
    
    JPanel _AB_panPrincTmp = new JPanel();
    _AB_panPrincTmp.setLayout(new GridLayout(0, 1));
    _AB_classePrincipale.add(_AB_panPrincTmp);
    _AB_lista.setBackground(Color.BLUE);
    _AB_lista.setModel(_AB_elencoVoci);
    _AB_panPrincTmp.add(_AB_lista);
    
    JPanel _AB_panSecTmp = new JPanel();
    _AB_panSecTmp.setLayout(new GridLayout(0, 3));
    JLabel _AB_LblUno = new JLabel("CLIENTE");
    _AB_panSecTmp.add(_AB_LblUno);
    _AB_TxtUno.setName("CLIENTE");
    _AB_LblUno.setForeground(Color.RED);
    _AB_panSecTmp.add(_AB_TxtUno);
    _AB_panSecTmp.add(_AB_BtnUno);
    JLabel _AB_LblDue = new JLabel("INDIRIZZO");
    _AB_panSecTmp.add(_AB_LblDue);
    _AB_TxtDue.setName("INDIRIZZO");
    _AB_TxtDue.setBackground(Color.YELLOW);
    _AB_panSecTmp.add(_AB_TxtDue);
    _AB_panSecTmp.add(_AB_BtnDue);
    JLabel _AB_LblTre = new JLabel("CALDAIA");
    _AB_panSecTmp.add(_AB_LblTre);
    _AB_TxtTre.setName("CALDAIA");
    _AB_panSecTmp.add(_AB_TxtTre);
    _AB_panSecTmp.add(_AB_BtnTre);
    JLabel _AB_LblQuattro = new JLabel("MESE REVIS.");
    _AB_panSecTmp.add(_AB_LblQuattro);
    _AB_panSecTmp.add(_AB_TxtQuattro);
    _AB_panSecTmp.add(_AB_BtnQuattro);
    _AB_classePrincipale.add(_AB_panSecTmp);
    
    JPanel _AB_panTerzTmp = new JPanel();
    _AB_panTerzTmp.setLayout(new GridLayout(0, 1));
	_AB_classePrincipale.setTitle(_AB_classePrincipale.getClass().toString());
    _AB_listaSelezionati.setBackground(Color.GREEN);
    _AB_listaSelezionati.setModel(_AB_elencoVociSelezionate);
    _AB_panTerzTmp.add(_AB_listaSelezionati);
    _AB_classePrincipale.add(_AB_panTerzTmp);
	// PREDISPOSIZIONE LAYOUT


	// INSERIMENTO COMPONENTI NEL FORM CENTRALE
    
    
	// IMPOSTAZIONE DEI PANEL

	// GESTIONE EVENTI PULSANTI
	_AB_BtnUno.addActionListener(new ActionListener() {
		public void actionPerformed(final ActionEvent e) {
            carica_elemento();
        }
	});
    
	_AB_BtnDue.addActionListener(new ActionListener() {
		public void actionPerformed(final ActionEvent e) {
            rimuovi_elemento();

		}
	});
    
	_AB_BtnTre.addActionListener(new ActionListener() {
		public void actionPerformed(final ActionEvent e) {
                intervento();
		}
	});
    
    _AB_BtnQuattro.addActionListener(new ActionListener() {
		public void actionPerformed(final ActionEvent e) {
                evadi_AB_();
		}
	});
}

static void carica_elemento(){
            if(_AB_TxtUno.getText().equals("") || _AB_TxtDue.getText().equals("") || _AB_TxtTre.getText().equals("")){
            JOptionPane.showMessageDialog(null, "Inserire prima tutti i campi","Messaggio", JOptionPane.INFORMATION_MESSAGE);
            }else{
        try {
            _AB_elencoVociSelezionate.addElement(_AB_TxtUno.getText() + '-' + _AB_TxtDue.getText() + '-' + _AB_TxtTre.getText() + '-' + _AB_TxtQuattro.getSelectedItem().toString());
            _AB_TxtUno.setText("");
            _AB_TxtDue.setText("");
            _AB_TxtTre.setText("");
            _AB_TxtQuattro.setSelectedIndex(0);	;
            
        } catch (Exception e) {
            JOptionPane.showInternalMessageDialog(null, "Dati di input errati:"+e.getMessage(), "Errore", JOptionPane.ERROR_MESSAGE);
        }  
            }
 }                           
                            
static void intervento(){
    if (_AB_listaSelezionati.getSelectedIndex() != -1) {
            String datiSel = _AB_listaSelezionati.getSelectedValue();
            _AB_elencoVoci.addElement(datiSel);
        }else{
             JOptionPane.showMessageDialog(null, "Selezionare un campo della lista, per poterlo rimuove","Messaggio", JOptionPane.INFORMATION_MESSAGE);
        }
}

static void evadi_AB_(){
        if(_AB_lista.getSelectedIndex() == -1){
            JOptionPane.showMessageDialog(null, "Selezionare un campo della lista, per poterlo rimuove","Messaggio", JOptionPane.INFORMATION_MESSAGE);
        }else{
        File fatture = new File("daFatturare.txt");
        if (fatture.isFile()) {
            try {
                FileWriter fileWriter = new FileWriter(fatture,true);
				BufferedWriter bufferedWriter = new BufferedWriter(fileWriter);
				PrintWriter prntWriter = new PrintWriter(bufferedWriter);
				DateTimeFormatter formato = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");
 				LocalDateTime ora = LocalDateTime.now();  
				prntWriter.println(formato.format(ora) +"-"+_AB_lista.getSelectedValue().toString());
				prntWriter.close();
				bufferedWriter.close();
                fileWriter.close();
            } catch (IOException e) {
                JOptionPane.showInternalMessageDialog(null, e.getMessage(), "Errore",JOptionPane.ERROR_MESSAGE);
            }
        }
    
        try {
                _AB_elencoVoci.remove(_AB_lista.getSelectedIndex());
            } catch (Exception ex) {
                    JOptionPane.showInternalMessageDialog(null, "Errore :" +ex.getMessage(), "Errore", JOptionPane.ERROR_MESSAGE);
            } 
        }
}

static void rimuovi_elemento(){
            if(_AB_listaSelezionati.getSelectedIndex() == -1){
            JOptionPane.showMessageDialog(null, "Selezionare un campo della lista, per poterlo rimuove","Messaggio", JOptionPane.INFORMATION_MESSAGE);
            }else{
            try {
                _AB_elencoVociSelezionate.remove(_AB_listaSelezionati.getSelectedIndex());
            } catch (Exception ex) {
                    JOptionPane.showInternalMessageDialog(null, "Errore :" +ex.getMessage(), "Errore", JOptionPane.ERROR_MESSAGE);
            }              
         }
  }
    
    



}
